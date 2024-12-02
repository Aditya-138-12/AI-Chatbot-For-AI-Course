import React, { useState, useEffect, useRef } from 'react';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import {
    Button,
    Card,
    CardContent,
    Typography,
    Box,
    CircularProgress,
    Avatar,
    Alert,
    AlertTitle,
    Menu,
    MenuItem,
    Modal,
    Fade,
    Backdrop,
    TextField,
    InputAdornment,
    IconButton,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    Google,
    Send,
    Clear,
    MoreVert,
    ChatBubbleOutline,
    Delete
} from '@mui/icons-material';
import { app } from '../firebase';

import {
    Switch,
    FormControlLabel,
    RadioGroup,
    Radio,
    FormControl,
    FormLabel,
    Grid,
    Tooltip,
    Paper
} from '@mui/material';
import {
    Settings,
    Palette,
    VolumeUp,
    Security,
    Notifications,
    DarkMode,
    Language,
    ExitToApp,
    FormatSize
} from '@mui/icons-material';

import {
    Grow,
    Zoom   // Zoom is from @mui/material, not @mui/icons-material
} from '@mui/material';

import {
    Lightbulb,
    Create,
    School,
    FitnessCenter
} from '@mui/icons-material';

import { ContentCopy, Check } from '@mui/icons-material';

import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark-dimmed.css';

const SignIn = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [authError, setAuthError] = useState(null);
    const [showDebugInfo, setShowDebugInfo] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [openLogoutModal, setOpenLogoutModal] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [loadingResponse, setLoadingResponse] = useState(false);
    const [chats, setChats] = useState([{ id: 'default', name: 'New Chat', messages: [] }]);
    const [currentChatId, setCurrentChatId] = useState('default');
    const auth = getAuth(app);
    const messagesEndRef = useRef(null);
    const [openSettingsModal, setOpenSettingsModal] = useState(false);
    const [ContentOBJ, setContentOBJ] = useState({});
    const [settings, setSettings] = useState({
        theme: 'light',
        notifications: true,
        sound: true,
        language: 'english',
        fontSize: 'medium'
    });
    const suggestionsPool = [
        {
            text: "Tell me an interesting fact about space",
            icon: <Lightbulb />,
            category: "Knowledge"
        },
        {
            text: "Write a short story about a magical forest",
            icon: <Create />,
            category: "Creative"
        },
        {
            text: "Explain quantum computing in simple terms",
            icon: <School />,
            category: "Learning"
        },
        {
            text: "Help me plan a weekly workout routine",
            icon: <FitnessCenter />,
            category: "Health"
        },
        {
            text: "Write a poem about autumn",
            icon: <Create />,
            category: "Creative"
        },
        {
            text: "Explain how blockchain works",
            icon: <School />,
            category: "Learning"
        },
        {
            text: "Share a recipe for a healthy smoothie",
            icon: <FitnessCenter />,
            category: "Health"
        },
        {
            text: "Tell me about ancient civilizations",
            icon: <Lightbulb />,
            category: "Knowledge"
        },
        {
            text: "Create a bedtime story for kids",
            icon: <Create />,
            category: "Creative"
        },
        {
            text: "Explain artificial intelligence basics",
            icon: <School />,
            category: "Learning"
        },
        {
            text: "Design a meditation routine",
            icon: <FitnessCenter />,
            category: "Health"
        },
        {
            text: "Share facts about deep ocean life",
            icon: <Lightbulb />,
            category: "Knowledge"
        },
        {
            text: "Write a Lettter to the Principal For Fee Waiver, My USN is 1SJ22CS0XX and My Name is ____________",
            icon: <Lightbulb />,
            category: "Knowledge"
        }
    ];

    const handleSuggestionClick = (suggestionText) => {
        setChatInput(suggestionText);
        // Optional: You can choose to automatically send the message when a suggestion is clicked
        setShowSuggestions(false);
    };

    const getRandomSuggestions = (count = 4) => {
        const shuffled = [...suggestionsPool].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    const [showSuggestions, setShowSuggestions] = useState(true);
    const [currentSuggestions, setCurrentSuggestions] = useState(getRandomSuggestions());


    const handleSettingChange = (setting, value) => {
        const newSettings = {
            ...settings,
            [setting]: value
        };
        setSettings(newSettings);
        applySettings(newSettings);
    };



    const [darkMode, setDarkMode] = useState(false);

    const applySettings = (newSettings) => {
        // Apply theme
        if (newSettings.theme === 'dark') {
            document.body.style.backgroundColor = '#121212';
            document.body.style.color = '#fff';
            setDarkMode(true);
        } else {
            document.body.style.backgroundColor = '#fff';
            document.body.style.color = '#000';
            setDarkMode(false);
        }

        // Apply font size
        const rootElement = document.documentElement;
        switch (newSettings.fontSize) {
            case 'small':
                rootElement.style.fontSize = '14px';
                break;
            case 'medium':
                rootElement.style.fontSize = '16px';
                break;
            case 'large':
                rootElement.style.fontSize = '18px';
                break;
        }
    };
    // 4. Add useEffect to apply settings on component mount
    useEffect(() => {
        applySettings(settings);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsLoading(false);
            if (currentUser) {
                setTimeout(() => setShowDebugInfo(false), 1000);
            }
        });

        return () => unsubscribe();
    }, [auth]);

    const handleNewChat = () => {
        setCurrentSuggestions(getRandomSuggestions());
        setShowSuggestions(true);
        const newChatId = `chat-${Date.now()}`;
        const newChat = {
            id: newChatId,
            name: 'New Chat',
            messages: []
        };

        setChats(prevChats => [...prevChats, newChat]);
        setCurrentChatId(newChatId);
        setChatHistory([]);
        setChatInput('');
    };

    const switchChat = (chatId) => {
        setCurrentChatId(chatId);
        const chat = chats.find(c => c.id === chatId);
        setChatHistory(chat?.messages || []);
    };

    const deleteChat = (chatId, event) => {
        event.stopPropagation();
        setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
        if (currentChatId === chatId) {
            const remainingChats = chats.filter(chat => chat.id !== chatId);
            if (remainingChats.length > 0) {
                switchChat(remainingChats[0].id);
            } else {
                handleNewChat();
            }
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true);
            setAuthError(null);
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const result = await signInWithPopup(auth, provider);
            setUser(result.user);
        } catch (error) {
            setAuthError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            setIsLoading(true);
            await signOut(auth);
            setUser(null);
            setShowDebugInfo(true);
            setOpenLogoutModal(false);
            setChats([{ id: 'default', name: 'New Chat', messages: [] }]);
            setCurrentChatId('default');
        } catch (error) {
            setAuthError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (chatInput.trim() !== '') {
            setShowSuggestions(false);
            const userMessage = chatInput;



            const newMessage = { user: 'You', message: userMessage };

            // Update chat history for current chat
            const updatedHistory = [...chatHistory, newMessage];
            setChatHistory(updatedHistory);

            // Update chats state
            setChats(prevChats =>
                prevChats.map(chat =>
                    chat.id === currentChatId
                        ? { ...chat, messages: updatedHistory }
                        : chat
                )
            );

            setChatInput('');
            setLoadingResponse(true);

            try {
                const response = await fetch('https://adityasaroha456.pythonanywhere.com/groq_example', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: userMessage }),
                });

                if (response.ok) {
                    const data = await response.json();

                    const assistantMessage = data.responses.join('').replace(/\n/g, '<br />');
                    console.log(typeof (assistantMessage));


                    const matchedContent = data.responses.join('').match(/```([\s\S]*?)```/g);
                    const contentObj = {};

                    if (matchedContent) {
                        matchedContent.forEach((match, index) => {
                            // Extract the content between backticks by removing the backtick markers
                            const content = match.slice(3, -3);
                            // Store each content with a key based on its order (index)
                            contentObj[`content${index + 1}`] = content;
                        });
                    }

                    // for (let i in contentObj) { console.log(contentObj[i]); }

                    setContentOBJ(contentObj);

                    console.log("ContentOBJ is", ContentOBJ);

                    console.log("Assistant Message", assistantMessage);


                    const newAssistantMessage = { user: 'Assistant', message: assistantMessage };
                    console.log("newAssistantMessage", newAssistantMessage['message']);
                    const finalHistory = [...updatedHistory, newAssistantMessage];

                    setChatHistory(finalHistory);
                    setChats(prevChats =>
                        prevChats.map(chat =>
                            chat.id === currentChatId
                                ? { ...chat, messages: finalHistory, name: userMessage.slice(0, 30) + '...' }
                                : chat
                        )
                    );
                }
            } catch (error) {
                console.error('Error sending message:', error);
            } finally {
                setLoadingResponse(false);
            }
        }
    };



    const renderMessageContent = () => {
        // Access contentObj from state and render it
        return Object.keys(ContentOBJ).map((key, index) => {
            const content = ContentOBJ[key];

            // Check if the content is a code block
            if (content) {
                return (
                    <pre key={index} style={{
                        margin: '16px 0',
                        padding: '16px',
                        borderRadius: '8px',
                        backgroundColor: '#22272e',
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap', // Preserve line breaks in code
                    }}>
                        <code style={{ fontFamily: 'monospace', color: '#f8f8f2' }}>
                            {content} {/* Render code content directly */}
                        </code>
                    </pre>
                );
            }
        });
    };


    const MenuComponent = () => (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
        >
            {/* Only show settings if user is logged in */}
            {user && (
                <MenuItem onClick={() => {
                    setOpenSettingsModal(true);
                    setAnchorEl(null);
                }}>
                    <ListItemIcon>
                        <Settings fontSize="small" />
                    </ListItemIcon>
                    Settings
                </MenuItem>
            )}
            <MenuItem onClick={() => setOpenLogoutModal(true)}>
                <ListItemIcon>
                    <ExitToApp fontSize="small" />
                </ListItemIcon>
                Logout
            </MenuItem>
        </Menu>
    );


    const SettingsModal = () => (
        <Modal
            open={openSettingsModal}
            onClose={() => setOpenSettingsModal(false)}  // This closes the modal
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{ timeout: 500 }}
        >
            <Fade in={openSettingsModal}>
                <Paper
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 600,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}
                >
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                            Settings
                        </Typography>
                        <Divider />
                    </Box>

                    {/* User Profile Section */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Profile</Typography>
                        <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                            <Avatar
                                src={user?.photoURL}
                                alt={user?.displayName}
                                sx={{ width: 64, height: 64, mr: 2 }}
                            />
                            <Box>
                                <Typography variant="h6">{user?.displayName}</Typography>
                                <Typography color="text.secondary">{user?.email}</Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Grid container spacing={3}>
                        {/* Appearance Settings */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Palette sx={{ mr: 1 }} />
                                    <Typography variant="h6">Appearance</Typography>
                                </Box>
                                <FormControl component="fieldset" sx={{ width: '100%' }}>
                                    <FormLabel component="legend">Theme</FormLabel>
                                    <RadioGroup
                                        value={settings.theme}
                                        onChange={(e) => handleSettingChange('theme', e.target.value)}  // Keeps modal open
                                    >
                                        <FormControlLabel value="light" control={<Radio />} label="Light" />
                                        <FormControlLabel value="dark" control={<Radio />} label="Dark" />
                                        <FormControlLabel value="system" control={<Radio />} label="System Default" />
                                    </RadioGroup>
                                </FormControl>
                            </Paper>
                        </Grid>

                        {/* Notification Settings */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Notifications sx={{ mr: 1 }} />
                                    <Typography variant="h6">Notifications</Typography>
                                </Box>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.notifications}
                                            onChange={(e) => handleSettingChange('notifications', e.target.checked)} // Keeps modal open
                                        />
                                    }
                                    label="Enable Notifications"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.sound}
                                            onChange={(e) => handleSettingChange('sound', e.target.checked)} // Keeps modal open
                                        />
                                    }
                                    label="Sound Effects"
                                />
                            </Paper>
                        </Grid>

                        {/* Language Settings */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Language sx={{ mr: 1 }} />
                                    <Typography variant="h6">Language</Typography>
                                </Box>
                                <FormControl component="fieldset" sx={{ width: '100%' }}>

                                    <RadioGroup
                                        value={settings.language}
                                        onChange={(e) => handleSettingChange('language', e.target.value)} // Keeps modal open
                                    >
                                        <FormControlLabel value="english" control={<Radio />} label="English" />
                                        <FormControlLabel value="spanish" control={<Radio />} label="Spanish" />
                                        <FormControlLabel value="french" control={<Radio />} label="French" />
                                    </RadioGroup>
                                </FormControl>
                            </Paper>
                        </Grid>

                        {/* Text Settings */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <FormatSize sx={{ mr: 1 }} />
                                    <Typography variant="h6">Text Size</Typography>
                                </Box>
                                <FormControl component="fieldset" sx={{ width: '100%' }}>
                                    <RadioGroup
                                        value={settings.fontSize}
                                        onChange={(e) => handleSettingChange('fontSize', e.target.value)} // Keeps modal open
                                    >
                                        <FormControlLabel value="small" control={<Radio />} label="Small" />
                                        <FormControlLabel value="medium" control={<Radio />} label="Medium" />
                                        <FormControlLabel value="large" control={<Radio />} label="Large" />
                                    </RadioGroup>
                                </FormControl>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            onClick={() => setOpenSettingsModal(false)} // Closes modal
                            color="inherit"
                            sx={{ mr: 1 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => {
                                // Here you would typically save settings to backend/localStorage
                                setOpenSettingsModal(false); // Closes modal
                            }}
                        >
                            Save Changes
                        </Button>
                    </Box>
                </Paper>
            </Fade>
        </Modal>
    );





    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const SuggestionsBox = () => (
        <Box
            sx={{
                display: showSuggestions && chatHistory.length === 0 ? 'grid' : 'none',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 2,
                marginBottom: 3,
                padding: '20px 0'
            }}
        >
            {currentSuggestions.map((suggestion, index) => (
                <Zoom
                    key={index}
                    in={showSuggestions}
                    style={{ transitionDelay: `${index * 100}ms` }}
                >
                    <Card
                        onClick={() => handleSuggestionClick(suggestion.text)}
                        sx={{
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: darkMode
                                    ? '0 4px 20px rgba(255,255,255,0.1)'
                                    : '0 4px 20px rgba(0,0,0,0.1)',
                                bgcolor: darkMode ? '#333' : '#f8f9fa'
                            },
                            display: 'flex',
                            flexDirection: 'column',
                            p: 2,
                            borderRadius: '12px',
                            border: `1px solid ${darkMode ? '#444' : '#e0e0e0'}`,
                            bgcolor: darkMode ? '#1e1e1e' : '#fff',
                            color: darkMode ? '#fff' : 'inherit',
                        }}
                    >
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 1,
                            color: darkMode ? '#90caf9' : 'primary.main'
                        }}>
                            {suggestion.icon}
                            <Typography
                                variant="caption"
                                sx={{
                                    ml: 1,
                                    color: darkMode ? '#999' : 'text.secondary',
                                    fontWeight: 500,
                                    textTransform: 'uppercase',
                                    fontSize: '0.7rem',
                                    letterSpacing: '0.5px'
                                }}
                            >
                                {suggestion.category}
                            </Typography>
                        </Box>
                        <Typography
                            variant="body2"
                            sx={{
                                color: darkMode ? '#fff' : 'text.primary',
                                lineHeight: 1.5,
                                fontWeight: 400
                            }}
                        >
                            {suggestion.text}
                        </Typography>
                    </Card>
                </Zoom>
            ))}
        </Box>
    );

    // Add this new component for the "Examples" heading
    const SuggestionsHeader = () => (
        <Grow in={showSuggestions && chatHistory.length === 0}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography
                    variant="h6"
                    sx={{
                        color: darkMode ? '#999' : 'text.secondary',
                        fontWeight: 500,
                        '& span': {
                            color: darkMode ? '#90caf9' : 'primary.main',
                            fontWeight: 600
                        }
                    }}
                >
                    Try these <span>examples</span>
                </Typography>
            </Box>
        </Grow>
    );

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            if (event.shiftKey) {
                setChatInput(prev => prev + '\n');
            } else {
                event.preventDefault();
                handleSendMessage();
            }
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">
                    Loading...
                </Typography>

                {/*<MenuComponent />
                <SettingsModal />*/}

            </Box>
        );
    }

    const formatText = (text) => {
        return text
            .replace(/\*\*/g, '')
            .replace(/\s+/g, ' ')
            .replace(/<br\s*\/?>/g, '\n')  // Convert <br> tags to newlines
            .trim();
    };



    return (
        <Box display="flex" height="100vh">
            {!user ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" width="100%">
                    <Typography variant="h5" gutterBottom>
                        Welcome
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Please sign in to continue
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Google />}
                        onClick={handleGoogleSignIn}
                        sx={{
                            py: 1.5,
                            textTransform: 'none',
                            bgcolor: '#1976d2',
                            '&:hover': { bgcolor: '#115293' },
                        }}
                    >
                        Continue with Google
                    </Button>
                </Box>
            ) : (
                <>
                    {/* Sidebar and other components */}

                    <MenuComponent />
                    <SettingsModal />

                    {/* Rest of the chat and other components */}
                    {/* Sidebar */}
                    <Box
                        sx={{
                            flex: '0 0 300px',
                            backgroundColor: darkMode ? '#1e1e1e' : '#f5f5f5',
                            borderRight: `1px solid ${darkMode ? '#333' : '#ddd'}`,
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            '& .MuiListItem-root': {
                                '&:hover': {
                                    backgroundColor: darkMode ? '#333' : '#e3f2fd',
                                },
                                '&.Mui-selected': {
                                    backgroundColor: darkMode ? '#404040' : '#e3f2fd',
                                },
                            },
                            '& .MuiTypography-root': {
                                color: darkMode ? '#fff' : 'inherit',
                            },
                            '& .MuiListItemIcon-root': {
                                color: darkMode ? '#fff' : 'inherit',
                            },
                        }}
                    >
                        <Box p={2}>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<ChatBubbleOutline />}
                                onClick={handleNewChat}
                                sx={{
                                    mb: 2,
                                    textTransform: 'none',
                                    bgcolor: darkMode ? '#2196f3' : '#1976d2',
                                    '&:hover': {
                                        bgcolor: darkMode ? '#1976d2' : '#115293'
                                    },
                                }}
                            >
                                New Chat
                            </Button>
                        </Box>

                        <Divider />

                        {/* Chat List */}
                        <List sx={{
                            flex: 1,
                            overflowY: 'auto',
                            '& .MuiListItem-root': {
                                color: darkMode ? '#fff' : 'inherit',
                            }
                        }}>
                            {chats.map((chat) => (
                                <ListItem
                                    key={chat.id}
                                    button
                                    selected={currentChatId === chat.id}
                                    onClick={() => switchChat(chat.id)}
                                    sx={{
                                        '&.Mui-selected': {
                                            backgroundColor: darkMode ? '#404040' : '#e3f2fd',
                                            '&:hover': {
                                                backgroundColor: darkMode ? '#4a4a4a' : '#e3f2fd',
                                            },
                                        },
                                        '&:hover': {
                                            backgroundColor: darkMode ? '#333' : '#f5f5f5',
                                        },
                                    }}
                                >
                                    <ListItemIcon>
                                        <ChatBubbleOutline />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={chat.name}
                                        sx={{
                                            '& .MuiListItemText-primary': {
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }
                                        }}
                                    />
                                    {chats.length > 1 && (
                                        <IconButton
                                            size="small"
                                            onClick={(e) => deleteChat(chat.id, e)}
                                            sx={{
                                                ml: 1,
                                                color: darkMode ? '#fff' : 'inherit',
                                                '&:hover': {
                                                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                                                }
                                            }}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    )}
                                </ListItem>
                            ))}
                        </List>

                        <Divider sx={{
                            borderColor: darkMode ? '#333' : 'rgba(0, 0, 0, 0.12)'
                        }} />

                        {/* User Profile Section */}
                        <Box p={2} sx={{
                            backgroundColor: darkMode ? '#1e1e1e' : '#f5f5f5',
                            '& .MuiTypography-root': {
                                color: darkMode ? '#fff' : 'inherit',
                            },
                            '& .MuiIconButton-root': {
                                color: darkMode ? '#fff' : 'inherit',
                            },
                        }}>
                            <Box display="flex" alignItems="center">
                                <Avatar src={user.photoURL} alt={user.displayName} />
                                <Box ml={2} flex={1}>
                                    <Typography variant="body1">{user.displayName}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {user.email}
                                    </Typography>
                                </Box>
                                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                                    <MoreVert />
                                </IconButton>
                            </Box>
                        </Box>

                        <MenuComponent />
                    </Box>

                    {/* Chat Box */}
                    <Box sx={{
                        flex: '1 1 auto', display: 'flex', flexDirection: 'column', padding: '16px', backgroundColor: darkMode ? '#121212' : '#fff',
                        color: darkMode ? '#fff' : '#000',
                    }}>
                        <Box sx={{ flex: '1 1 auto', overflowY: 'auto', padding: '8px 0' }}>
                            {chatHistory.map((message, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: message.user === 'You' ? 'row-reverse' : 'row',
                                        alignItems: 'center',
                                        marginBottom: '8px',
                                    }}
                                >
                                    <Avatar
                                        src={message.user === 'You' ? user?.photoURL : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2k80VVHwo7zrwu8B05i7xynYC1iOgBEwUfQ&s'}
                                        alt={message.user}
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            marginRight: message.user === 'You' ? 0 : 2,
                                            marginLeft: message.user === 'You' ? 2 : 0,
                                        }}
                                    />
                                    <Card
                                        sx={{
                                            backgroundColor: message.user === 'You'
                                                ? '#1976d2'
                                                : darkMode ? '#333' : '#f5f5f5',
                                            color: message.user === 'You' || darkMode
                                                ? '#fff'
                                                : '#333',
                                            padding: '8px 12px',
                                            borderRadius: '16px',
                                            maxWidth: '70%',
                                        }}
                                    >
                                        <Typography
                                            variant="body1"
                                            component="span"
                                            style={{ whiteSpace: 'pre-wrap' }}  // This preserves line breaks
                                        >
                                            {formatText(message.message)}

                                        </Typography>


                                    </Card>
                                </Box>
                            ))}
                            {loadingResponse && (
                                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                    <Avatar
                                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2k80VVHwo7zrwu8B05i7xynYC1iOgBEwUfQ&s"
                                        alt="Assistant"
                                        sx={{ width: 32, height: 32, marginRight: 2 }}
                                    />
                                    <CircularProgress size={24} sx={{ marginRight: 2 }} />
                                    Assistant is typing
                                </Box>

                            )}
                            <div ref={messagesEndRef} />
                            {renderMessageContent()}
                        </Box>

                        {SuggestionsHeader()}
                        {SuggestionsBox()}

                        <TextField
                            variant="outlined"
                            fullWidth
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message..."
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: darkMode ? '#333' : '#fff',
                                    '& fieldset': {
                                        borderColor: darkMode ? '#555' : 'rgba(0, 0, 0, 0.23)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: darkMode ? '#666' : 'rgba(0, 0, 0, 0.23)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#1976d2',
                                    },
                                },
                                '& .MuiInputBase-input': {
                                    color: darkMode ? '#fff' : 'inherit',
                                    '&::placeholder': {
                                        color: darkMode ? '#888' : 'rgba(0, 0, 0, 0.54)',
                                        opacity: 1,
                                    },
                                },
                                '& .MuiIconButton-root': {
                                    color: darkMode ? '#fff' : 'inherit',
                                },
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleSendMessage}
                                            disabled={loadingResponse}
                                            sx={{
                                                color: darkMode ? '#fff' : 'inherit',
                                                '&.Mui-disabled': {
                                                    color: darkMode ? '#555' : 'rgba(0, 0, 0, 0.26)',
                                                },
                                            }}
                                        >
                                            <Send />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                </>
            )}

            {/* Logout Confirmation Modal */}
            <Modal
                open={openLogoutModal}
                onClose={() => setOpenLogoutModal(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500 }}
            >
                <Fade in={openLogoutModal}>
                    <Card sx={{ width: 300, padding: 2, textAlign: 'center', bgcolor: 'white', boxShadow: 3, borderRadius: 2, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <Typography variant="h6">Logout</Typography>
                        <Typography variant="body1">Are you sure you want to logout?</Typography>
                        <Box mt={2}>
                            <Button onClick={handleLogout} color="error" backgroundColor="red">Logout</Button>
                            <Button onClick={() => setOpenLogoutModal(false)} color="primary" sx={{ marginLeft: 1 }}>
                                Cancel
                            </Button>
                        </Box>
                    </Card>
                </Fade>
            </Modal>
        </Box>
    );
};

export default SignIn;
