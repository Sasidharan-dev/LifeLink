import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, MessageCircle, Users, ArrowLeft, CheckCheck } from 'lucide-react'
import { messageAPI, donorAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { getApiData, getErrorMessage } from '../utils/app'
import toast from 'react-hot-toast'

function formatTime(dt) {
  const date = new Date(dt)
  return Number.isNaN(date.getTime())
    ? '--:--'
    : date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dt) {
  const date = new Date(dt)
  if (Number.isNaN(date.getTime())) {
    return 'Unknown day'
  }

  const today = new Date()
  if (date.toDateString() === today.toDateString()) return 'Today'
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-IN', { dateStyle: 'medium' })
}

export default function Chat() {
  const { userId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [contacts, setContacts] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loadingContacts, setLoadingContacts] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const pollRef = useRef(null)

  useEffect(() => {
    donorAPI.getAll()
      .then(response => {
        const donors = getApiData(response, [])
        const uniqueContacts = donors
          .filter(donor => donor.userId !== user?.id)
          .map(donor => ({
            id: donor.userId,
            name: donor.userName || 'Unknown donor',
            sub: `Blood: ${donor.bloodGroup || '--'} - ${[donor.city, donor.state].filter(Boolean).join(', ') || donor.location || 'No location'}`,
          }))

        const seen = new Set()
        setContacts(uniqueContacts.filter(contact => {
          if (seen.has(contact.id)) {
            return false
          }
          seen.add(contact.id)
          return true
        }))
      })
      .catch(() => setContacts([]))
      .finally(() => setLoadingContacts(false))
  }, [user])

  useEffect(() => {
    if (!userId || contacts.length === 0) {
      return
    }

    const found = contacts.find(contact => contact.id === Number.parseInt(userId, 10))
    if (found) {
      setSelectedUser(found)
    }
  }, [userId, contacts])

  const loadMessages = useCallback(async () => {
    if (!selectedUser) {
      return
    }

    setLoadingMessages(true)
    try {
      const response = await messageAPI.getConversation(selectedUser.id)
      setMessages(getApiData(response, []))
    } catch {
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }, [selectedUser])

  useEffect(() => {
    loadMessages()
    if (pollRef.current) {
      clearInterval(pollRef.current)
    }
    pollRef.current = setInterval(loadMessages, 5000)

    return () => {
      clearInterval(pollRef.current)
    }
  }, [loadMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (event) => {
    event.preventDefault()
    if (!text.trim() || !selectedUser || !user?.id) {
      return
    }

    setSending(true)
    const optimistic = {
      id: Date.now(),
      senderId: user.id,
      senderName: user.name,
      receiverId: selectedUser.id,
      content: text.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
    }

    setMessages(current => [...current, optimistic])
    setText('')

    try {
      await messageAPI.send({ receiverId: selectedUser.id, content: optimistic.content })
      await loadMessages()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to send message'))
      setMessages(current => current.filter(message => message.id !== optimistic.id))
    } finally {
      setSending(false)
    }
  }

  const groupedMessages = useMemo(() => messages.reduce((accumulator, message) => {
    const key = formatDate(message.createdAt)
    if (!accumulator[key]) {
      accumulator[key] = []
    }
    accumulator[key].push(message)
    return accumulator
  }, {}), [messages])

  const selectContact = (contact) => {
    setSelectedUser(contact)
    navigate(`/messages/${contact.id}`, { replace: true })
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4 animate-fade-in">
      <div className={`w-72 shrink-0 flex-col glass-card overflow-hidden ${selectedUser ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/8">
          <h2 className="font-display font-semibold text-white flex items-center gap-2">
            <MessageCircle size={18} className="text-blood-400" /> Messages
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Donors and patients</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingContacts ? (
            [...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-white/8 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 rounded bg-white/8" />
                  <div className="h-2 w-32 rounded bg-white/5" />
                </div>
              </div>
            ))
          ) : contacts.length === 0 ? (
            <div className="p-6 text-center">
              <Users size={24} className="text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No donors to chat with yet</p>
            </div>
          ) : (
            contacts.map(contact => (
              <button
                key={contact.id}
                onClick={() => selectContact(contact)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  selectedUser?.id === contact.id
                    ? 'bg-blood-900/40 border border-blood-800/40'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blood-700 to-blood-950 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {contact.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{contact.name}</p>
                  <p className="text-xs text-gray-500 truncate">{contact.sub}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className={`flex-1 flex-col glass-card overflow-hidden ${!selectedUser ? 'hidden lg:flex' : 'flex'}`}>
        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <MessageCircle size={28} className="text-gray-500" />
            </div>
            <h3 className="font-semibold text-gray-300 mb-1">Select a conversation</h3>
            <p className="text-sm text-gray-500">Choose a donor or patient from the list to start chatting.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-white/8">
              <button
                onClick={() => {
                  setSelectedUser(null)
                  navigate('/messages', { replace: true })
                }}
                className="lg:hidden p-1.5 rounded-lg hover:bg-white/8 text-gray-400"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blood-700 to-blood-950 flex items-center justify-center text-white font-bold text-sm">
                {selectedUser.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{selectedUser.name}</p>
                <p className="text-xs text-gray-500">{selectedUser.sub}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-blood-700 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle size={32} className="text-gray-600 mb-3" />
                  <p className="text-sm text-gray-400">No messages yet</p>
                  <p className="text-xs text-gray-600 mt-1">Say hello to get the conversation started.</p>
                </div>
              ) : (
                Object.entries(groupedMessages).map(([date, grouped]) => (
                  <div key={date}>
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-white/6" />
                      <span className="text-xs text-gray-600 px-3">{date}</span>
                      <div className="flex-1 h-px bg-white/6" />
                    </div>

                    {grouped.map((message, index) => {
                      const isMe = message.senderId === user?.id
                      const showAvatar = !isMe && (index === 0 || grouped[index - 1]?.senderId !== message.senderId)
                      return (
                        <div key={message.id} className={`flex items-end gap-2 mb-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                          {!isMe && (
                            <div className={`w-7 h-7 rounded-lg shrink-0 ${showAvatar ? 'bg-gradient-to-br from-blood-700 to-blood-950 flex items-center justify-center text-white text-xs font-bold' : 'opacity-0'}`}>
                              {showAvatar ? selectedUser.name?.[0]?.toUpperCase() || '?' : ''}
                            </div>
                          )}

                          <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isMe
                                ? 'bg-blood-700 text-white rounded-br-sm'
                                : 'bg-white/8 text-gray-200 rounded-bl-sm'
                            }`}>
                              {message.content}
                            </div>
                            <div className={`flex items-center gap-1 mt-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                              <span className="text-[10px] text-gray-600">{formatTime(message.createdAt)}</span>
                              {isMe && (
                                <CheckCheck size={11} className={message.isRead ? 'text-blood-400' : 'text-gray-600'} />
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-3 p-4 border-t border-white/8">
              <input
                type="text"
                placeholder={`Message ${selectedUser.name}...`}
                value={text}
                onChange={event => setText(event.target.value)}
                className="input-field flex-1 py-2.5"
                maxLength={2000}
              />
              <button
                type="submit"
                disabled={!text.trim() || sending}
                className="w-10 h-10 rounded-xl bg-blood-700 hover:bg-blood-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all active:scale-95 shrink-0"
              >
                {sending
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Send size={16} />
                }
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
