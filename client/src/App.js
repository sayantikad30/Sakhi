import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './index.css'; // Ensure Tailwind CSS is imported

// Base URL for your backend API
// This line is crucial: it reads from the environment variable set on Render.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || ''); // Store user's email

  const [stories, setStories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28); // Default cycle length
  const [trackerMessage, setTrackerMessage] = useState('');
  const [nextPeriodInfo, setNextPeriodInfo] = useState('');

  const [currentLanguage, setCurrentLanguage] = useState('en'); // 'en' for English, 'hi' for Hindi

  const translations = {
    en: {
      appTitle: 'Sakhi', // Added translation for 'Sakhi'
      nav: {
        home: 'Home',
        periodStories: 'First Period Stories',
        menstrualTracker: 'Menstrual Cycle Tracker',
        quiz: 'Quiz',
        boysSection: 'For Partners',
        blogSection: 'Blog Section',
        login: 'Login',
        signup: 'Sign Up',
        logout: 'Logout',
        switchLang: 'Switch to Hindi',
      },
      home: {
        slogan1: 'Your trusted companion in health and wellness.',
        slogan2: 'Empowering women through knowledge and community.',
        pregnancyCareTitle: 'Pregnancy Care',
        pregnancyCareContent: 'Comprehensive guidance for a healthy pregnancy journey, from conception to childbirth. Learn about prenatal care, nutrition, exercise, and what to expect during each trimester. Empower yourself with knowledge for a joyful motherhood experience.',
        pcodTitle: 'Understanding PCOD',
        pcodContent: 'Polycystic Ovary Syndrome (PCOS) affects millions of women. Discover the symptoms, causes, and effective management strategies for PCOD. From lifestyle changes to medical treatments, find support and information to navigate this common hormonal disorder.',
        fertilityTitle: 'Fertility Insights',
        fertilityContent: 'Explore factors influencing fertility, tips for conception, and information on fertility treatments. Whether you are trying to conceive or simply want to understand your reproductive health better, this section provides valuable insights and resources.',
        menstrualHygieneTitle: 'Menstrual Hygiene',
        menstrualHygieneContent: 'Learn about best practices for menstrual hygiene to ensure health and comfort during your period. This includes proper disposal methods, choosing the right products, and maintaining cleanliness to prevent infections.',
        endometriosisTitle: 'Endometriosis Awareness',
        endometriosisContent: 'Gain a deeper understanding of endometriosis, a condition where tissue similar to the lining of the uterus grows outside the uterus. Recognize the symptoms and learn about diagnosis and management options to improve quality of life.',
        learnMore: 'Learn More',
        homepageFactsHeading: 'Mind-Blowing Facts & Articles',
      },
      periodStories: {
        heading: 'Share Your Period Story',
        storyPrompt: 'Share your first period story or helpful do\'s and don\'ts for teenagers.',
        storytellerName: 'Your Name (Optional)',
        submitStory: 'Submit Story',
        noStories: 'No stories yet. Be the first to share!',
        storiesHeading: 'Period Stories',
        loginToPost: 'Please log in to share your story.'
      },
      menstrualTracker: {
        heading: 'Menstrual Cycle Tracker',
        lastPeriodLabel: 'Last Period Date:',
        cycleLengthLabel: 'Average Cycle Length (days):',
        trackCycle: 'Track Cycle',
        nextPeriodDate: 'Your next period is estimated to be around:',
        ovulationDate: 'Your estimated ovulation date is around:',
        warning: 'Visit your gynecologist as soon as possible.',
        loginToTrack: 'Please log in to track your menstrual cycle.'
      },
      quiz: {
        heading: 'Quiz Time!',
        startQuiz: 'Start Quiz',
        nextQuestion: 'Next Question',
        submitQuiz: 'Submit Quiz',
        score: 'Your Score:',
        restartQuiz: 'Restart Quiz',
        questions: [
          {
            question: 'What is the average length of a menstrual cycle?',
            options: ['14 days', '28 days', '35 days', '45 days'],
            answer: '28 days',
          },
          {
            question: 'Which hormone primarily triggers ovulation?',
            options: ['Estrogen', 'Progesterone', 'Luteinizing Hormone (LH)', 'Follicle-Stimulating Hormone (FSH)'],
            answer: 'Luteinizing Hormone (LH)',
          },
          {
            question: 'What is the shedding of the uterine lining called?',
            options: ['Ovulation', 'Fertilization', 'Menstruation', 'Implantation'],
            answer: 'Menstruation',
          },
          {
            question: 'PCOS stands for:',
            options: ['Period Cramp Ovary Syndrome', 'Polycystic Ovary Syndrome', 'Pre-Cramping Ovulation System', 'Pelvic Cystic Ovarian Symptoms'],
            answer: 'Polycystic Ovary Syndrome',
          },
          {
            question: 'Which of these is NOT a common symptom of PMS (Pre-Menstrual Syndrome)?',
            options: ['Mood swings', 'Bloating', 'Increased energy', 'Food cravings'],
            answer: 'Increased energy',
          },
        ],
      },
      boysSection: {
        heading: 'For Boys: Understanding and Supporting Her',
        intro: 'Understanding the menstrual cycle is crucial for boys to be supportive and empathetic towards girls and women in their lives. Here\'s how you can better understand and offer comfort during menstruation:',
        point1Title: 'Educate Yourself',
        point1Content: 'Learn the basics of the menstrual cycle. Knowing what\'s happening biologically can demystify the process and help you understand why she might be experiencing certain symptoms. Knowledge is the first step towards empathy.',
        point1Link: 'https://www.girlshealth.gov/body/period/whatisit.html',
        point2Title: 'Be Empathetic, Not Dismissive',
        point2Content: 'Periods can come with a range of physical symptoms like cramps, backache, bloating, and fatigue, as well as emotional changes due to hormonal fluctuations. Avoid saying "it\'s all in your head" or "just get over it." Acknowledge her discomfort and validate her feelings.',
        point2Link: 'https://kidshealth.org/en/teens/pms.html',
        point3Title: 'Offer Practical Support',
        point3Content: 'Small gestures can make a big difference. Offer to get her a hot water bottle, pain relievers, her favorite comfort food, or just a warm blanket. Ask if she needs anything and respect her space if she needs quiet time.',
        point3Link: 'https://www.verywellhealth.com/how-to-help-someone-with-period-cramps-5207798',
        point4Title: 'Communicate Openly',
        point4Content: 'Encourage open conversation about her period. Let her know it\'s a natural bodily function and there\'s no need to feel embarrassed. Being approachable helps her feel comfortable discussing her needs or discomforts with you.',
        point4Link: 'https://www.plannedparenthood.org/blog/how-do-i-talk-about-my-period-with-friends-and-family',
        point5Title: 'Respect Her Needs',
        point5Content: 'Understand that her energy levels or mood might fluctuate. She might not feel like being as active or social as usual. Respect her boundaries and preferences during this time. Patience and understanding are key.',
        point5Link: 'https://www.healthline.com/health/menstruation/period-support',
      },
      blogSection: {
        heading: 'Blog Posts',
        titleLabel: 'Blog Title:',
        contentLabel: 'Blog Content:',
        postBlog: 'Post Blog',
        noBlogs: 'No blog posts yet. Be the first to post!',
        loginToPost: 'Please log in to post a blog.'
      },
      phrases: [
        'Empowering women through knowledge and community.',
        'Your trusted companion in health and wellness.',
        'Understanding every cycle, supporting every journey.',
        'Breaking taboos, building confidence.',
        'Knowledge is power, especially about your body.',
      ],
      userIdDisplay: 'Logged in as User ID:',
    },
    hi: {
      appTitle: 'सखी', // Added Hindi translation for 'Sakhi'
      nav: {
        home: 'मुख्य पृष्ठ',
        periodStories: 'पीरियड की कहानियाँ',
        menstrualTracker: 'मासिक धर्म ट्रैकर',
        quiz: 'प्रश्नोत्तरी',
        boysSection: 'लड़कों का अनुभाग',
        blogSection: 'ब्लॉग अनुभाग',
        login: 'लॉग इन',
        signup: 'साइन अप',
        logout: 'लॉग आउट',
        switchLang: 'अंग्रेजी में स्विच करें',
      },
      home: {
        slogan1: 'स्वास्थ्य और कल्याण में आपका विश्वसनीय साथी।',
        slogan2: 'ज्ञान और समुदाय के माध्यम से महिलाओं को सशक्त बनाना।',
        pregnancyCareTitle: 'गर्भावस्था की देखभाल',
        pregnancyCareContent: 'गर्भाधान से लेकर प्रसव तक, स्वस्थ गर्भावस्था यात्रा के लिए व्यापक मार्गदर्शन। प्रसवपूर्व देखभाल, पोषण, व्यायाम और हर तिमाही के दौरान क्या उम्मीद करनी चाहिए, इसके बारे में जानें। एक आनंदमय मातृत्व अनुभव के लिए ज्ञान के साथ खुद को सशक्त बनाएं।',
        pcodTitle: 'पीसीओडी को समझना',
        pcodContent: 'पॉलीसिस्टिक ओवरी सिंड्रोम (पीसीओएस) लाखों महिलाओं को प्रभावित करता है। पीसीओडी के लक्षणों, कारणों और प्रभावी प्रबंधन रणनीतियों की खोज करें। जीवन शैली में बदलाव से लेकर चिकित्सा उपचार तक, इस सामान्य हार्मोनल विकार को नेविगेट करने के लिए समर्थन और जानकारी प्राप्त करें।',
        fertilityTitle: 'प्रजनन क्षमता की जानकारी',
        fertilityContent: 'प्रजनन क्षमता को प्रभावित करने वाले कारकों, गर्भाधान के लिए सुझावों और प्रजनन उपचारों के बारे में जानकारी का अन्वेषण करें। चाहे आप गर्भधारण करने की कोशिश कर रही हों या बस अपने प्रजनन स्वास्थ्य को बेहतर ढंग से समझना चाहती हों, यह अनुभाग मूल्यवान अंतर्दृष्टि और संसाधन प्रदान करता है।',
        menstrualHygieneTitle: 'मासिक धर्म स्वच्छता',
        menstrualHygieneContent: 'अपनी मासिक धर्म के दौरान स्वास्थ्य और आराम सुनिश्चित करने के लिए मासिक धर्म स्वच्छता के सर्वोत्तम तरीकों के बारे में जानें। इसमें उचित निपटान विधियाँ, सही उत्पादों का चयन और संक्रमणों को रोकने के लिए स्वच्छता बनाए रखना शामिल है।',
        endometriosisTitle: 'एंडोमेट्रियोसिस जागरूकता',
        endometriosisContent: 'एंडोमेट्रियोसिस, एक ऐसी स्थिति जहाँ गर्भाशय की परत के समान ऊतक गर्भाशय के बाहर बढ़ता है, की गहरी समझ प्राप्त करें। लक्षणों को पहचानें और जीवन की गुणवत्ता में सुधार के लिए निदान और प्रबंधन विकल्पों के बारे में जानें।',
        learnMore: 'और अधिक जानें',
        homepageFactsHeading: 'मनमोहक तथ्य और लेख',
      },
      periodStories: {
        heading: 'अपनी पीरियड की कहानी साझा करें',
        storyPrompt: 'अपनी पहली पीरियड की कहानी या किशोरों के लिए सहायक क्या करें और क्या न करें साझा करें।',
        storytellerName: 'आपका नाम (वैकल्पिक)',
        submitStory: 'कहानी जमा करें',
        noStories: 'अभी तक कोई कहानी नहीं। साझा करने वाले पहले व्यक्ति बनें!',
        storiesHeading: 'पीरियड की कहानियाँ',
        loginToPost: 'अपनी कहानी साझा करने के लिए कृपया लॉग इन करें.'
      },
      menstrualTracker: {
        heading: 'मासिक धर्म ट्रैकर',
        lastPeriodLabel: 'अंतिम मासिक धर्म की तारीख:',
        cycleLengthLabel: 'औसत चक्र की लंबाई (दिन):',
        trackCycle: 'चक्र ट्रैक करें',
        nextPeriodDate: 'आपका अगला मासिक धर्म अनुमानित है:',
        ovulationDate: 'आपकी अनुमानित ओव्यूलेशन तिथि है:',
        warning: 'जितनी जल्दी हो सके अपनी स्त्री रोग विशेषज्ञ से मिलें।',
        loginToTrack: 'अपने मासिक धर्म चक्र को ट्रैक करने के लिए कृपया लॉग इन करें.'
      },
      quiz: {
        heading: 'प्रश्नोत्तरी का समय!',
        startQuiz: 'प्रश्नोत्तरी शुरू करें',
        nextQuestion: 'अगला प्रश्न',
        submitQuiz: 'प्रश्नोत्तरी जमा करें',
        score: 'आपका स्कोर:',
        restartQuiz: 'प्रश्नोत्तरी पुनः प्रारंभ करें',
        questions: [
          {
            question: 'मासिक धर्म चक्र की औसत लंबाई कितनी होती है?',
            options: ['14 दिन', '28 दिन', '35 दिन', '45 दिन'],
            answer: '28 दिन',
          },
          {
            question: 'कौन सा हार्मोन मुख्य रूप से ओव्यूलेशन को ट्रिगर करता है?',
            options: ['एस्ट्रोजन', 'प्रोजेस्टेरोन', 'ल्यूटिनाइजिंग हार्मोन (LH)', 'कूप-उत्तेजक हार्मोन (FSH)'],
            answer: 'ल्यूटिनाइजिंग हार्मोन (LH)',
          },
          {
            question: 'गर्भाशय की परत के झड़ने को क्या कहा जाता है?',
            options: ['ओव्यूलेशन', 'निषेचन', 'मासिक धर्म', 'प्रत्यारोपण'],
            answer: 'मासिक धर्म',
          },
          {
            question: 'पीसीओएस का पूर्ण रूप क्या है?',
            options: ['पीरियड क्रैम्प ओवरी सिंड्रोम', 'PCOS stands for:', 'Polycystic Ovary Syndrome', 'Pre-Cramping Ovulation System', 'Pelvic Cystic Ovarian Symptoms'],
            answer: 'Polycystic Ovary Syndrome',
          },
          {
            question: 'इनमें से कौन सा पीएमएस (प्री-मेंस्ट्रुअल सिंड्रोम) का एक सामान्य लक्षण नहीं है?',
            options: ['मूड में बदलाव', 'पेट फूलना', 'बढ़ी हुई ऊर्जा', 'भोजन की लालसा'],
            answer: 'बढ़ी हुई ऊर्जा',
          },
        ],
      },
      boysSection: {
        heading: 'लड़कों के लिए: उसे समझना और उसका समर्थन करना',
        intro: 'मासिक धर्म चक्र को समझना लड़कों के लिए अपने जीवन में लड़कियों और महिलाओं के प्रति सहायक और सहानुभूतिपूर्ण होने के लिए महत्वपूर्ण है। यहाँ बताया गया है कि आप मासिक धर्म के दौरान उसे बेहतर ढंग से कैसे समझ सकते हैं और उसे आराम दे सकते हैं:',
        point1Title: 'खुद को शिक्षित करें',
        point1Content: 'मासिक धर्म चक्र की मूल बातें जानें। जैविक रूप से क्या हो रहा है, यह जानने से प्रक्रिया को रहस्यमय बनाया जा सकता है और आपको यह समझने में मदद मिल सकती है कि उसे कुछ लक्षण क्यों अनुभव हो रहे हैं। ज्ञान सहानुभूति की दिशा में पहला कदम है।',
        point1Link: 'https://www.girlshealth.gov/body/period/whatisit.html',
        point2Title: 'Be Empathetic, Not Dismissive',
        point2Content: 'पीरियड के साथ ऐंठन, पीठ दर्द, पेट फूलना और थकान जैसे शारीरिक लक्षण, साथ ही हार्मोनल उतार-चढ़ाव के कारण भावनात्मक परिवर्तन भी हो सकते हैं। यह कहने से बचें कि "यह सब तुम्हारे दिमाग में है" या "बस इसे भूल जाओ।" उसकी परेशानी को स्वीकार करें और उसकी भावनाओं को मान्य करें।',
        point2Link: 'https://kidshealth.org/en/teens/pms.html',
        point3Title: 'Offer Practical Support',
        point3Content: 'Small gestures can make a big difference. Offer to get her a hot water bottle, pain relievers, her favorite comfort food, or just a warm blanket. Ask if she needs anything and respect her space if she needs quiet time.',
        point3Link: 'https://www.verywellhealth.com/how-to-help-someone-with-period-cramps-5207798',
        point4Title: 'Communicate Openly',
        point4Content: 'Encourage open conversation about her period. Let her know it\'s a natural bodily function and there\'s no need to feel embarrassed. Being approachable helps her feel comfortable discussing her needs or discomforts with you.',
        point4Link: 'https://www.plannedparenthood.org/blog/how-do-i-talk-about-my-period-with-friends-and-family',
        point5Title: 'Respect Her Needs',
        point5Content: 'Understand that her energy levels or mood might fluctuate. She might not feel like being as active or social as usual. Respect her boundaries and preferences during this time. Patience and understanding are key.',
        point5Link: 'https://www.healthline.com/health/menstruation/period-support',
      },
      blogSection: {
        heading: 'ब्लॉग पोस्ट',
        titleLabel: 'Blog Title:',
        contentLabel: 'Blog Content:',
        postBlog: 'पोस्ट ब्लॉग', // Corrected 'Post Blog' to 'पोस्ट ब्लॉग' for consistency
        noBlogs: 'अभी तक कोई ब्लॉग पोस्ट नहीं। पोस्ट करने वाले पहले व्यक्ति बनें!',
        loginToPost: 'ब्लॉग पोस्ट करने के लिए कृपया लॉग इन करें.'
      },
      phrases: [
        'ज्ञान और समुदाय के माध्यम से महिलाओं को सशक्त बनाना।',
        'स्वास्थ्य और कल्याण में आपका विश्वसनीय साथी।',
        'हर चक्र को समझना, हर यात्रा का समर्थन करना।',
        'वर्जनाओं को तोड़ना, आत्मविश्वास का निर्माण करना।',
      ],
      userIdDisplay: 'यूजर आईडी के रूप में लॉग इन:',
    },
  };

  const t = (key) => {
    const keys = key.split('.');
    let result = translations[currentLanguage];
    for (const k of keys) {
      if (result && result[k] !== undefined) {
        result = result[k];
      } else {
        return key; // Fallback to key if translation not found
      }
    }
    return result;
  };

  const handleLanguageToggle = () => {
    setCurrentLanguage(prevLang => prevLang === 'en' ? 'hi' : 'en');
  };

  // --- Auth Functions ---
  const handleAuth = async (isRegister) => {
    setMessage(''); // Clear previous messages
    try {
      const url = isRegister ? `${API_BASE_URL}/auth/register` : `${API_BASE_URL}/auth/login`;
      const response = await axios.post(url, { email, password }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.headers['content-type'] && !response.headers['content-type'].includes('application/json')) {
        const textResponse = await response.data;
        setMessage(`Server error or unexpected response type. Please check backend server status. Response: ${textResponse.substring(0, 100)}...`);
        return;
      }

      const data = response.data;
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userEmail', data.email);
        setToken(data.token);
        setUserId(data.userId);
        setUserEmail(data.email);
        setLoggedIn(true);
        setMessage(data.message || 'Authentication successful!');
        setEmail('');
        setPassword('');
        setActiveSection('home');
      } else {
        setMessage(data.message || 'Authentication failed.');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      if (error.response) {
        setMessage(error.response.data.message || 'Authentication failed. Please check your credentials or server.');
      } else if (error.request) {
        setMessage('No response from server. Please ensure the backend is running and accessible.');
      } else {
        setMessage('Error during authentication request. ' + error.message);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    setToken('');
    setUserId('');
    setUserEmail('');
    setLoggedIn(false);
    setMessage('Logged out successfully.');
    setActiveSection('home');
  };

  useEffect(() => {
    // Check local storage for token on app load
    if (localStorage.getItem('token')) {
      setLoggedIn(true);
      setToken(localStorage.getItem('token'));
      setUserId(localStorage.getItem('userId'));
      setUserEmail(localStorage.getItem('userEmail'));
    }
  }, []);

  // Effect to clear messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000); // 3000 milliseconds = 3 seconds
      return () => clearTimeout(timer); // Clean up the timer if component unmounts or message changes
    }
  }, [message]); // Re-run this effect whenever 'message' changes


  // --- Data Fetching Functions (Memoized with useCallback) ---
  const fetchStories = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stories`);
      setStories(response.data);
    } catch (error) {
      console.error('Error fetching stories:', error);
      // setMessage('Failed to load period stories.');
    }
  }, []); // No dependencies for this simple fetch

  const fetchBlogs = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/blogs`);
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      // setMessage('Failed to load blog posts.');
    }
  }, []); // No dependencies for this simple fetch

  const fetchTrackerData = useCallback(async () => {
    if (!token || !userId) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/tracker`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data;
      setLastPeriodDate(data.lastPeriodDate);
      setCycleLength(data.cycleLength);
      setTrackerMessage('');
      calculateNextPeriod(data.lastPeriodDate, data.cycleLength);
    }
      catch (error) {
      if (error.response && error.response.status === 404) {
        setTrackerMessage('No tracker data found. Please enter your details.');
      } else {
        console.error('Error fetching tracker data:', error);
        setTrackerMessage('Failed to load tracker data.');
      }
    }
  }, [token, userId]);

  useEffect(() => {
    if (activeSection === 'periodStories') {
      fetchStories();
    }
    if (activeSection === 'blogSection') {
      fetchBlogs();
    }
    if (activeSection === 'menstrualTracker' && loggedIn) {
      fetchTrackerData();
    }
  }, [activeSection, loggedIn, fetchStories, fetchBlogs, fetchTrackerData]);


  // --- Period Stories Section ---
  const [newStory, setNewStory] = useState('');
  const [newStoryteller, setNewStoryteller] = useState('');

  const handleStorySubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage('Please log in to post a story.');
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/stories`, { story: newStory, storyteller: newStoryteller || userEmail }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Story posted successfully!');
      setNewStory('');
      setNewStoryteller('');
      fetchStories(); // Re-fetch stories to update the list
    } catch (error) {
      console.error('Error posting story:', error);
      setMessage('Failed to post story.');
    }
  };

  // --- Menstrual Tracker Section ---
  const calculateNextPeriod = (lastDate, length) => {
    if (!lastDate || !length) {
      setNextPeriodInfo('');
      return;
    }
    const last = new Date(lastDate);
    const next = new Date(last);
    next.setDate(last.getDate() + parseInt(length));
    setNextPeriodInfo(`${next.toDateString()}`);

    const ovulation = new Date(next);
    ovulation.setDate(next.getDate() - 14); // Roughly 14 days before next period
    setOvulationDateInfo(ovulation.toDateString());

    // Warning for unusual cycle length
    if (length < 21 || length > 35) {
      setTrackerMessage(t('menstrualTracker.warning'));
    } else {
      setTrackerMessage('');
    }
  };

  const handleTrackerSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage('Please log in to track your cycle.');
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/tracker`, { lastPeriodDate, cycleLength: parseInt(cycleLength) }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(response.data.message || 'Tracker data saved!');
      calculateNextPeriod(lastPeriodDate, cycleLength);
      // No need to call fetchTrackerData explicitly here as calculateNextPeriod updates UI directly
    } catch (error) {
      console.error('Error saving tracker data:', error);
      setMessage('Failed to save tracker data.');
    }
  };
  const [ovulationDateInfo, setOvulationDateInfo] = useState('');

  // --- Quiz Section ---
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setQuizFinished(false);
  };

  const handleAnswerSelect = (option) => {
    setSelectedAnswer(option);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === t('quiz.questions')[currentQuestionIndex].answer) {
      setScore(score + 1);
    }
    setSelectedAnswer(null); // Reset for next question

    if (currentQuestionIndex < t('quiz.questions').length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizFinished(true);
      setQuizStarted(false);
    }
  };

  const restartQuiz = () => {
    startQuiz(); // Reset all quiz states
  };

  // --- Blog Section ---
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogContent, setNewBlogContent] = useState('');

  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage('Please log in to post a blog.');
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/blogs`, { title: newBlogTitle, content: newBlogContent }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Blog posted successfully!');
      setNewBlogTitle('');
      setNewBlogContent('');
      fetchBlogs(); // Re-fetch blogs to update the list
    } catch (error) {
      console.error('Error posting blog:', error);
      setMessage('Failed to post blog.');
    }
  };

  // Typewriter effect for Sakhi
  const [sakhiText, setSakhiText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  // Set fullSakhi based on current language
  const fullSakhi = t('appTitle');

  // Effect for the typewriter animation logic
  useEffect(() => {
    if (isTyping) {
      if (charIndex < fullSakhi.length) {
        const timeoutId = setTimeout(() => {
          setSakhiText(fullSakhi.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, 150); // Typing speed
        return () => clearTimeout(timeoutId);
      } else {
        setIsTyping(false);
        const resetTimeout = setTimeout(() => {
          setCharIndex(0);
          setSakhiText(''); // Clear text to re-type
          setIsTyping(true);
        }, 1000); // 1-second pause
        return () => clearTimeout(resetTimeout);
      }
    }
  }, [charIndex, isTyping, fullSakhi]); // Added fullSakhi as dependency

  // New effect to reset typewriter when language changes
  useEffect(() => {
    setCharIndex(0);
    setSakhiText('');
    setIsTyping(true);
  }, [currentLanguage]); // Dependency: currentLanguage

  // --- Dynamic Document Title Effect ---
  useEffect(() => {
    const baseTitle = t('appTitle'); // "Sakhi" or "सखी"
    let sectionName = '';

    switch (activeSection) {
      case 'home':
        sectionName = t('nav.home');
        break;
      case 'periodStories':
        sectionName = t('nav.periodStories');
        break;
      case 'menstrualTracker':
        sectionName = t('nav.menstrualTracker');
        break;
      case 'quiz':
        sectionName = t('nav.quiz');
        break;
      case 'boysSection':
        sectionName = t('nav.boysSection');
        break;
      case 'blogSection':
        sectionName = t('nav.blogSection');
        break;
      default:
        sectionName = ''; // Fallback
    }

    if (sectionName && activeSection !== 'home') {
      document.title = `${sectionName} - ${baseTitle}`;
    } else {
      document.title = baseTitle; // For home, just "Sakhi"
    }
  }, [activeSection, currentLanguage, t]); // Dependencies: activeSection, currentLanguage, and t (since t depends on currentLanguage)


  // Floating phrases animation
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [phraseVisible, setPhraseVisible] = useState(true);

  useEffect(() => {
    const phrases = t('phrases');
    const interval = setInterval(() => {
      setPhraseVisible(false); // Start fade-out
      setTimeout(() => {
        setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
        setPhraseVisible(true); // Start fade-in
      }, 1000); // Duration of fade-out
    }, 5000); // Change phrase every 5 seconds (including fade in/out)

    return () => clearInterval(interval);
  }, [t]);


  const PhraseComponent = ({ phrase, isVisible }) => (
    <p
      className={`absolute transition-opacity duration-1000 ease-in-out text-lg md:text-xl font-medium text-pink-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full px-4 transform ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } animate-float`}
      style={{ animationDelay: '0s' }} // Ensure animation starts immediately
    >
      {phrase}
    </p>
  );


  // Common styling for buttons
  const buttonClass = "px-4 py-2 rounded-lg bg-pink-500 text-white font-semibold hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-75 transition duration-300 ease-in-out shadow-md hover:shadow-lg";
  const inputClass = "w-full p-3 rounded-lg border border-pink-300 focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50 transition duration-200 ease-in-out";
  const cardClass = "bg-white p-6 rounded-lg shadow-xl mb-6 transform transition-transform duration-300 hover:scale-[1.01]";

  return (
    <div className="min-h-screen bg-pink-50 text-gray-800 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow-lg py-4 px-6 md:px-10 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50">
        <nav className="flex-grow flex justify-center md:justify-center mb-4 md:mb-0 space-x-4 md:space-x-8">
          {['home', 'periodStories', 'menstrualTracker', 'quiz', 'boysSection', 'blogSection'].map(
            (section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`text-lg font-medium hover:text-pink-600 transition-colors duration-200 ${
                  activeSection === section ? 'text-pink-700 border-b-2 border-pink-700' : 'text-gray-600'
                }`}
              >
                {t(`nav.${section}`)}
              </button>
            )
          )}
        </nav>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLanguageToggle}
            className="px-3 py-1 text-sm rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200 transition-colors duration-200"
          >
            {t('nav.switchLang')}
          </button>
          {!loggedIn ? (
            <>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 border rounded-md text-sm w-32"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-2 border rounded-md text-sm w-32"
              />
              <button onClick={() => handleAuth(false)} className={buttonClass + " text-sm"}>
                {t('nav.login')}
              </button>
              <button onClick={() => handleAuth(true)} className={buttonClass + " text-sm bg-pink-400 hover:bg-pink-500"}>
                {t('nav.signup')}
              </button>
            </>
          ) : (
            <button onClick={handleLogout} className={buttonClass + " text-sm"}>
              {t('nav.logout')}
            </button>
          )}
        </div>
      </header>

      {message && (
        <div className="bg-pink-100 text-pink-700 p-3 rounded-lg text-center mx-auto mt-4 w-11/12 md:w-2/3 shadow-md">
          {message}
        </div>
      )}
      {loggedIn && (
        <div className="text-right text-gray-600 text-sm mt-2 px-6 md:px-10">
          {t('userIdDisplay')} {userEmail || (userId ? userId.substring(0, 8) + '...' : 'N/A')}
        </div>
      )}


      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-10 md:py-12">
        {activeSection === 'home' && (
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-extrabold text-pink-700 mb-6 relative inline-block">
              <span className="typewriter-text">{sakhiText}</span>
              <span className="cursor"></span>
            </h1>
            <div className="relative h-12 min-h-[3rem] w-full mb-12 flex items-center justify-center overflow-hidden">
              <PhraseComponent phrase={t('phrases')[currentPhraseIndex]} isVisible={phraseVisible} />
            </div>

            <h2 className="text-4xl font-bold text-pink-600 mb-10 border-b-2 border-pink-300 pb-4">
              {t('home.homepageFactsHeading')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Pregnancy Care */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
                <img
                  src="/images/pregnancy-care.jpg" // Local Image Path Example
                  alt="Pregnancy Care"
                  className="w-full h-40 object-cover rounded-md mb-4"
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x250/FCE4EC/9C27B0?text=Pregnancy+Care" }}
                />
                <h3 className="text-xl font-semibold mb-2 text-pink-700">{t('home.pregnancyCareTitle')}</h3>
                <p className="text-gray-700 mb-4">{t('home.pregnancyCareContent')}</p>
                <a
                  href="https://www.who.int/news-room/fact-sheets/detail/maternal-mortality"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-500 hover:text-pink-700 font-medium transition-colors duration-200"
                >
                  {t('home.learnMore')}
                </a>
              </div>

              {/* PCOD */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
                <img
                  src="/images/pcod-info.jpg" // Local Image Path Example
                  alt="PCOD Understanding"
                  className="w-full h-40 object-cover rounded-md mb-4"
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x250/FCE4EC/9C27B0?text=PCOD+Info" }}
                />
                <h3 className="text-xl font-semibold mb-2 text-pink-700">{t('home.pcodTitle')}</h3>
                <p className="text-gray-700 mb-4">{t('home.pcodContent')}</p>
                <a
                  href="https://www.womenshealth.gov/a-z-topics/polycystic-ovary-syndrome"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-500 hover:text-pink-700 font-medium transition-colors duration-200"
                >
                  {t('home.learnMore')}
                </a>
              </div>

              {/* Fertility Insights */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
                <img
                  src="/images/fertility-insights.jpg" // Local Image Path Example
                  alt="Fertility Insights"
                  className="w-full h-40 object-cover rounded-md mb-4"
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x250/FCE4EC/9C27B0?text=Fertility+Insights" }}
                />
                <h3 className="text-xl font-semibold mb-2 text-pink-700">{t('home.fertilityTitle')}</h3>
                <p className="text-gray-700 mb-4">{t('home.fertilityContent')}</p>
                <a
                  href="https://www.cdc.gov/reproductivehealth/infertility/index.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-500 hover:text-pink-700 font-medium transition-colors duration-200"
                >
                  {t('home.learnMore')}
                </a>
              </div>

              {/* Menstrual Hygiene */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
                <img
                  src="/images/menstrual-hygiene.jpg" // Local Image Path Example
                  alt="Menstrual Hygiene"
                  className="w-full h-40 object-cover rounded-md mb-4"
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x250/FCE4EC/9C27B0?text=Menstrual+Hygiene" }}
                />
                <h3 className="text-xl font-semibold mb-2 text-pink-700">{t('home.menstrualHygieneTitle')}</h3>
                <p className="text-gray-700 mb-4">{t('home.menstrualHygieneContent')}</p>
                <a
                  href="https://www.unicef.org/wash/menstrual-hygiene"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-500 hover:text-pink-700 font-medium transition-colors duration-200"
                >
                  {t('home.learnMore')}
                </a>
              </div>

              {/* Endometriosis Awareness */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
                <img
                  src="/images/endometriosis.jpg" // Local Image Path Example
                  alt="Endometriosis Awareness"
                  className="w-full h-40 object-cover rounded-md mb-4"
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x250/FCE4EC/9C27B0?text=Endometriosis" }}
                />
                <h3 className="text-xl font-semibold mb-2 text-pink-700">{t('home.endometriosisTitle')}</h3>
                <p className="text-gray-700 mb-4">{t('home.endometriosisContent')}</p>
                <a
                  href="https://www.endometriosis-uk.org/what-endometriosis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-500 hover:text-pink-700 font-medium transition-colors duration-200"
                >
                  {t('home.learnMore')}
                </a>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'periodStories' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-pink-600 mb-6 text-center">{t('periodStories.heading')}</h2>
            {loggedIn ? (
              <form onSubmit={handleStorySubmit} className={cardClass}>
                <div className="mb-4">
                  <label htmlFor="storyteller" className="block text-gray-700 text-sm font-bold mb-2">
                    {t('periodStories.storytellerName')}
                  </label>
                  <input
                    type="text"
                    id="storyteller"
                    value={newStoryteller}
                    onChange={(e) => setNewStoryteller(e.target.value)}
                    className={inputClass}
                    placeholder={userEmail}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="story" className="block text-gray-700 text-sm font-bold mb-2">
                    {t('periodStories.storyPrompt')}
                  </label>
                  <textarea
                    id="story"
                    rows="5"
                    value={newStory}
                    onChange={(e) => setNewStory(e.target.value)}
                    className={inputClass}
                    required
                  ></textarea>
                </div>
                <button type="submit" className={buttonClass + " w-full"}>
                  {t('periodStories.submitStory')}
                </button>
              </form>
            ) : (
              <p className="text-center text-gray-600 mb-6">{t('periodStories.loginToPost')}</p>
            )}

            <h3 className="text-2xl font-bold text-pink-600 mt-10 mb-6 text-center">{t('periodStories.storiesHeading')}</h3>
            {stories.length === 0 ? (
              <p className="text-center text-gray-600">{t('periodStories.noStories')}</p>
            ) : (
              <div className="space-y-6">
                {stories.map((story) => (
                  <div key={story._id} className={cardClass}>
                    <p className="text-gray-800 italic mb-3">{story.story}</p>
                    <p className="text-right text-sm text-gray-500">
                      - {story.storyteller || 'Anonymous'} on {new Date(story.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'menstrualTracker' && (
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-pink-600 mb-6 text-center">{t('menstrualTracker.heading')}</h2>
            {loggedIn ? (
              <form onSubmit={handleTrackerSubmit} className={cardClass}>
                <div className="mb-4">
                  <label htmlFor="lastPeriodDate" className="block text-gray-700 text-sm font-bold mb-2">
                    {t('menstrualTracker.lastPeriodLabel')}
                  </label>
                  <input
                    type="date"
                    id="lastPeriodDate"
                    value={lastPeriodDate}
                    onChange={(e) => setLastPeriodDate(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="cycleLength" className="block text-gray-700 text-sm font-bold mb-2">
                    {t('menstrualTracker.cycleLengthLabel')}
                  </label>
                  <input
                    type="number"
                    id="cycleLength"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(e.target.value)}
                    className={inputClass}
                    min="1"
                    required
                  />
                </div>
                <button type="submit" className={buttonClass + " w-full"}>
                  {t('menstrualTracker.trackCycle')}
                </button>
                {trackerMessage && (
                  <p className="mt-4 text-center text-red-600 font-semibold bg-red-100 p-3 rounded-lg">
                    {trackerMessage}
                  </p>
                )}
                {nextPeriodInfo && !trackerMessage && ( // Only show if no warning
                  <div className="mt-6 text-center text-gray-700">
                    <p className="text-lg font-medium">{t('menstrualTracker.nextPeriodDate')} <span className="text-pink-600 font-bold">{nextPeriodInfo}</span></p>
                    <p className="text-md font-medium mt-2">{t('menstrualTracker.ovulationDate')} <span className="text-pink-500 font-bold">{ovulationDateInfo}</span></p>
                  </div>
                )}
              </form>
            ) : (
              <p className="text-center text-gray-600 mb-6">{t('menstrualTracker.loginToTrack')}</p>
            )}
          </div>
        )}

        {activeSection === 'quiz' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-pink-600 mb-6 text-center">{t('quiz.heading')}</h2>
            {!quizStarted && !quizFinished && (
              <div className="text-center">
                <p className="text-lg text-gray-700 mb-6">Test your knowledge about menstrual health!</p>
                <button onClick={startQuiz} className={buttonClass}>
                  {t('quiz.startQuiz')}
                </button>
              </div>
            )}

            {quizStarted && (
              <div className={cardClass}>
                <h3 className="text-xl font-semibold mb-4 text-pink-700">
                  Question {currentQuestionIndex + 1} of {t('quiz.questions').length}
                </h3>
                <p className="text-lg mb-6 text-gray-800">
                  {t('quiz.questions')[currentQuestionIndex].question}
                </p>
                <div className="space-y-3 mb-6">
                  {t('quiz.questions')[currentQuestionIndex].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      className={`w-full text-left p-3 rounded-lg border-2 ${
                        selectedAnswer === option
                          ? 'border-pink-500 bg-pink-100'
                          : 'border-gray-200 hover:border-pink-300'
                      } transition-all duration-200`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {currentQuestionIndex < t('quiz.questions').length - 1 ? (
                  <button onClick={handleNextQuestion} disabled={selectedAnswer === null} className={buttonClass + " w-full"}>
                    {t('quiz.nextQuestion')}
                  </button>
                ) : (
                  <button onClick={handleNextQuestion} disabled={selectedAnswer === null} className={buttonClass + " w-full"}>
                    {t('quiz.submitQuiz')}
                  </button>
                )}
              </div>
            )}

            {quizFinished && (
              <div className={cardClass + " text-center"}>
                <h3 className="text-2xl font-bold text-pink-700 mb-4">{t('quiz.score')} {score} / {t('quiz.questions').length}</h3>
                <button onClick={restartQuiz} className={buttonClass}>
                  {t('quiz.restartQuiz')}
                </button>
              </div>
            )}
          </div>
        )}

        {activeSection === 'boysSection' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-pink-600 mb-6 text-center">{t('boysSection.heading')}</h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">{t('boysSection.intro')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={cardClass}>
                  <h3 className="text-xl font-semibold mb-3 text-pink-700">{t(`boysSection.point${i}Title`)}</h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">{t(`boysSection.point${i}Content`)}</p>
                  <a
                    href={t(`boysSection.point${i}Link`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-500 hover:text-pink-700 font-medium transition-colors duration-200"
                  >
                    {t('home.learnMore')}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'blogSection' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-pink-600 mb-6 text-center">{t('blogSection.heading')}</h2>
            {loggedIn ? (
              <form onSubmit={handleBlogSubmit} className={cardClass}>
                <div className="mb-4">
                  <label htmlFor="blogTitle" className="block text-gray-700 text-sm font-bold mb-2">
                    {t('blogSection.titleLabel')}
                  </label>
                  <input
                      type="text"
                      id="blogTitle"
                      value={newBlogTitle}
                      onChange={(e) => setNewBlogTitle(e.target.value)}
                      className={inputClass}
                      required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="blogContent" className="block text-gray-700 text-sm font-bold mb-2">
                    {t('blogSection.contentLabel')}
                  </label>
                  <textarea
                      id="blogContent"
                      rows="8"
                      value={newBlogContent}
                      onChange={(e) => setNewBlogContent(e.target.value)}
                      className={inputClass}
                      required
                  ></textarea>
                </div>
                <button type="submit" className={buttonClass + " w-full"}>
                  {t('blogSection.postBlog')}
                </button>
              </form>
            ) : (
              <p className="text-center text-gray-600 mb-6">{t('blogSection.loginToPost')}</p>
            )}

            <h3 className="text-2xl font-bold text-pink-600 mt-10 mb-6 text-center">{t('blogSection.heading')}</h3>
            {blogs.length === 0 ? (
              <p className="text-center text-gray-600">{t('blogSection.noBlogs')}</p>
            ) : (
              <div className="space-y-6">
                {blogs.map((blog) => (
                  <div key={blog._id} className={cardClass}>
                    <h4 className="text-xl font-semibold mb-2 text-pink-700">{blog.title}</h4>
                    <p className="text-gray-800 mb-3 leading-relaxed">{blog.content}</p>
                    <p className="text-right text-sm text-gray-500">
                      - {blog.author || 'Anonymous'} on {new Date(blog.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-pink-200 text-pink-800 py-6 text-center text-sm mt-10 shadow-inner">
        <p>&copy; {new Date().getFullYear()} Sakhi. All rights reserved. Empowering women's health and wellness.</p>
      </footer>

      {/* Tailwind CSS keyframes for animations - these should ideally be in index.css but placed here for self-containment */}
      <style>{`
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes blink-caret {
          from, to { border-color: transparent; }
          50% { border-color: pink; }
        }
        .typewriter-text {
          overflow: hidden; /* Ensures the content is not revealed until the animation */
          border-right: .15em solid pink; /* The typwriter cursor */
          white-space: nowrap; /* Keeps the content on a single line */
          margin: 0 auto; /* Gives that scrolling effect as the typing happens */
          letter-spacing: .15em; /* Adjust as needed */
          animation:
            typewriter 4s steps(40, end) forwards, /* Changed from infinite to forwards */
            blink-caret .75s step-end infinite;
        }

        /* Floating animation for phrases */
        @keyframes float {
          0% { transform: translate(-50%, -50%) translateY(0px); opacity: 0; }
          25% { opacity: 1; } /* Fade in */
          50% { transform: translate(-50%, -50%) translateY(-5px); opacity: 1;} /* Float up slightly */
          75% { transform: translate(-50%, -50%) translateY(0px); opacity: 1;} /* Float back down */
          100% { opacity: 0; } /* Fade out */
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }

        /* Responsive fonts */
        @media (max-width: 768px) {
          .text-6xl { font-size: 3.5rem; }
          .text-8xl { font-size: 5rem; }
          .text-lg { font-size: 1rem; }
          .text-xl { font-size: 1.125rem; }
        }
      `}</style>
    </div>
  );
}

export default App;

