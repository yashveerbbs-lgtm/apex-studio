// ----------------------------------------------------
  // THE REAL AI API CONNECTION 🧠
  // ----------------------------------------------------
  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    const userMessage = inputText
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }])
    setInputText('')
    setMood('thinking')

    try {
      // Call our secure Next.js backend API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      })

      const data = await response.json()
      
      setMood('excited')
      setMessages(prev => [...prev, { sender: 'spark', text: data.reply }])
      setTimeout(() => setMood('happy'), 2000)

    } catch (error) {
      setMood('dizzy')
      setMessages(prev => [...prev, { sender: 'spark', text: "Whoops! I lost connection to the mainframe. 😵‍💫" }])
      setTimeout(() => setMood('idle'), 2000)
    }
  }