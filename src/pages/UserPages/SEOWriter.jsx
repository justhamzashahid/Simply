import React, { useState, useEffect } from 'react';
import Editor from './Editor';  // Adjust the path as needed
import Sidebar from '../../components/Shared/Sidebar';
import { authService } from '../../api/auth';
import { seoService } from '../../api/seo';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { documentService } from '../../api/document';
import Flags from 'country-flag-icons/react/3x2';
import { useNavigate } from 'react-router-dom';
import RegenerationInput from './RegenerationInput'; 

import { 
  Bell, 
  Star, 
  ChevronDown, 
  Download, 
  Zap,
  Share2, 
  Link2, 
  Table, 
  Image, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  ListOrdered, 
  Quote, 
  MenuIcon,
  Play,
  Code,
  Check,
  X
} from 'lucide-react';



const languages = [
  { code: 'en-US', name: 'English (US)', country: 'US' },
  { code: 'es-ES', name: 'Spanish', country: 'ES' },
  { code: 'fr-FR', name: 'French', country: 'FR' },
  { code: 'de-DE', name: 'German', country: 'DE' },
  { code: 'it-IT', name: 'Italian', country: 'IT' },
  { code: 'pt-BR', name: 'Portuguese', country: 'BR' },
  { code: 'nl-NL', name: 'Dutch', country: 'NL' },
  { code: 'pl-PL', name: 'Polish', country: 'PL' },
  { code: 'ru-RU', name: 'Russian', country: 'RU' }
];

const SEOWriter = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [contentDescription, setContentDescription] = useState('');
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);
  const [focusIdeas, setFocusIdeas] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [wordCount, setWordCount] = useState("600"); 
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [userCredits, setUserCredits] = useState(0);
  const [currentDocumentId, setCurrentDocumentId] = useState(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt');
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    const user = authService.getUser();
    if (user) {
      setUserCredits(user.credits_left || 0);
    }
  }, []);

  // SEO keyword generation effect
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
        if (contentDescription.trim().length >= 10) {
            setIsLoadingKeywords(true);
            try {
                const response = await seoService.getKeywordSuggestions(
                    contentDescription,
                    selectedLanguage,
                    getModelIdentifier(selectedModel) // Add model to the request
                );
                setSuggestedKeywords(response.data);
            } catch (error) {
                showToastMessage(error.message || 'Error fetching keywords', 'error');
            } finally {
                setIsLoadingKeywords(false);
            }
        } else {
            setSuggestedKeywords([]);
        }
    }, 1000);

    return () => clearTimeout(debounceTimer);
}, [contentDescription, selectedLanguage, selectedModel]);

 

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarCollapsed(false);
      } else {
        setIsSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const getModelIdentifier = (modelName) => {
    // Add console.log to debug
    console.log('Original model selection:', modelName);
    
    // Convert to lowercase and trim
    const model = modelName.toLowerCase().trim();
    
    // Map frontend display names to backend model identifiers
    switch (model) {
        case 'gpt-4':
        case 'gpt':
            return 'gpt';
        case 'claude-sonnet':
        case 'claude':
            return 'claude';
        case 'deep-seek':
        case 'deepseek':
            return 'deepseek';
        default:
            return 'gpt'; // Default fallback
    }
};



  const validateWordCount = (value) => {
    // Allow empty string during typing
    if (value === "") return "";
    
    const numValue = parseInt(value);
    if (isNaN(numValue)) return "100";
    if (numValue < 100) return "100";
    if (numValue > 1600) return "1600";
    return String(numValue); // Convert back to string
  };

  const handleWordCountChange = (e) => {
    // Allow any input initially
    setWordCount(e.target.value);
  };
  
  const handleWordCountBlur = () => {
    // Validate on blur
    setWordCount(validateWordCount(wordCount));
  };

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const saveInitialDocument = async (content) => {
    try {
      const response = await documentService.saveDocument({
        name: contentDescription || 'SEO Content',
        type: 'SEO Writer',
        content: content
      });

      if (response.success) {
        setCurrentDocumentId(response.data._id);
        showToastMessage('Document saved successfully');
      }
    } catch (error) {
      console.error('Save document error:', error);
      showToastMessage(error.message || 'Error saving document', 'error');
    }
  };

  const autoSaveChanges = async (content) => {
    if (!currentDocumentId) return;

    try {
      const response = await documentService.updateDocument(currentDocumentId, content);
      if (response.success) {
        console.log('Auto-saved successfully');
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  const handleRunSEOWriter = async () => {
    if (!contentDescription || !selectedKeywords || !selectedKeywords.length) {
        showToastMessage('Please provide content description and select keywords', 'error');
        return;
    }

    setIsGenerating(true);
    try {
        const response = await seoService.generateContent({
            rankFor: contentDescription,
            selectedKeywords,
            focusIdeas,
            wordCount: parseInt(wordCount) || 600,
            language: selectedLanguage,
            model: getModelIdentifier(selectedModel) // Add model to the request
        });

        if (response.success) {
            setGeneratedContent(response.data.content);
            setShowResults(true);
            await saveInitialDocument(response.data.content);
            showToastMessage('Content generated successfully');
        }
    } catch (error) {
        showToastMessage(error.message || 'Error generating content', 'error');
    } finally {
        setIsGenerating(false);
    }
};

const handleDownload = async () => {
  try {
    const element = document.querySelector('.ProseMirror');
    if (!element) return;

    const canvas = await html2canvas(element);
    const pdf = new jsPDF();
    const imgData = canvas.toDataURL('image/png');
    
    pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
    pdf.save(`seo-content-${Date.now()}.pdf`);
    
    showToastMessage('Content downloaded successfully');
  } catch (error) {
    showToastMessage('Error downloading content', 'error');
  }
};


const handleRegenerate = async (regenerationPrompt) => {
  if (!generatedContent) {
      showToastMessage('No content to regenerate', 'error');
      return;
  }

  setIsRegenerating(true);
  try {
      const response = await seoService.regenerateContent({
          previousContent: generatedContent,
          regenerationPrompt,
          originalParams: {
              rankFor: contentDescription,
              selectedKeywords,
              focusIdeas,
              wordCount: parseInt(wordCount),
              language: selectedLanguage
          },
          model: selectedModel
      });

      if (response.success) {
        // Update the editor content with the new regenerated content
        console.log('Previous content:', generatedContent);
        console.log('New regenerated content:', response.data.content);
        setGeneratedContent(response.data.content);
        
        // If using a document ID, update it
        if (currentDocumentId) {
            await documentService.updateDocument(currentDocumentId, response.data.content);
        }
        
        showToastMessage('Content regenerated successfully');
    }
} catch (error) {
    showToastMessage(error.message || 'Error regenerating content', 'error');
} finally {
    setIsRegenerating(false);
}
};

  const toggleKeyword = (keyword) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };


  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden md:block md:fixed md:left-0 md:h-screen z-50">
        <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      </div>

      {/* Main Content */}
      <div className={`flex-1 w-full ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} transition-all duration-300`}>
        {/* Navbar */}
        <div className="sticky top-0 w-full bg-[#FDF8F6] py-4 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center">
              <button 
                className="md:hidden flex items-center p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              >
                <MenuIcon className="h-6 w-6" />
              </button>
              <div className="relative ml-auto">
                <button 
                  onClick={() => navigate('/notifications')}
                  className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <Bell className="w-6 h-6 text-gray-600" />
                  <span className="absolute top-1 right-2 w-2 h-2 bg-[#FF5341] rounded-full"></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column */}
            <div className="col-span-1 md:col-span-4 bg-[#FFFAF3] rounded-xl p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4">SEO Writer</h2>
              <p className="text-sm text-gray-600 mb-4">
                Turn A Title & Outline Into A Fully Complete High Quality SEO Content In Seconds
              </p>

              <div className="bg-[#FF5341] text-white rounded-lg p-3 mb-6 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Your Balance Is {userCredits} Credits
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Language Dropdown */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <button
                    onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                    className="w-full flex items-center justify-between p-2 border rounded-lg bg-white"
                  >
                    {selectedLanguage && (
                      <span className="flex items-center">
                        {(() => {
                          const FlagComponent = Flags[selectedLanguage.country];
                          return <FlagComponent className="w-5 h-4 mr-2" />;
                        })()}
                        {selectedLanguage.name}
                      </span>
                    )}
                    <ChevronDown className="w-5 h-5" />
                  </button>
                  {isLanguageDropdownOpen && (
                    <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                      {languages.map((lang) => {
                        const FlagComponent = Flags[lang.country];
                        return (
                          <button
                            key={lang.code}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
                            onClick={() => {
                              setSelectedLanguage(lang);
                              setIsLanguageDropdownOpen(false);
                            }}
                          >
                            <FlagComponent className="w-5 h-4 mr-2" />
                            {lang.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Content Description Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What do you want to rank for?
                  </label>
                  <input
                    type="text"
                    value={contentDescription}
                    onChange={(e) => setContentDescription(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Enter your content description (min. 10 characters)"
                  />
                  {contentDescription.length > 0 && contentDescription.length < 10 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Please enter at least 10 characters for keyword suggestions
                    </p>
                  )}
                </div>

                {/* Keywords Section */}
                {isLoadingKeywords && contentDescription.length >= 10 && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF5341]"></div>
                    <span>Generating keywords...</span>
                  </div>
                )}

                {suggestedKeywords.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Suggested Keywords
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {suggestedKeywords.map((keyword, index) => (
                        <button
                          key={index}
                          onClick={() => toggleKeyword(keyword)}
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm ${
                            selectedKeywords.includes(keyword)
                              ? 'bg-[#FF5341] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {keyword}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedKeywords.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selected Keywords
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedKeywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-[#FF5341] text-white"
                        >
                          {keyword}
                          <button
                            onClick={() => toggleKeyword(keyword)}
                            className="ml-2 hover:opacity-80"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Post Focus Idea <span className="text-gray-400">(Comma Separated)</span>
                  </label>
                  <input
                    type="text"
                    value={focusIdeas}
                    onChange={(e) => setFocusIdeas(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Eg. ROI, brand awareness, lead generation"
                  />
                </div>

                {/* AI Model Selection */}
                <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    AI Model
                </label>
                <select 
                className="w-full p-2 border rounded-lg bg-white"
                value={selectedModel}
                onChange={(e) => {
                    setSelectedModel(e.target.value);
                    console.log('Model selected:', e.target.value); // Debug log
                }}
            >
                <option value="gpt">GPT-4</option>
                <option value="claude">Claude-Sonnet</option>
                {/* <option value="deepseek">Deep-Seek</option> */}
            </select>
                {selectedModel !== 'gpt' && (
                    <p className="mt-1 text-sm text-gray-500">
                        Note: {selectedModel === 'claude' ? '1.5x' : '1.2x'} credit consumption rate applies
                    </p>
                )}
            </div>

                {/* Result Length */}
                <div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Length (words)
                  </label>
                  <div className="block">
                  <input
                    type="number"
                    value={wordCount}
                    onChange={handleWordCountChange}
                    onBlur={handleWordCountBlur}
                    className="w-full p-2 border rounded-lg focus:ring-[#FF5341] focus:border-[#FF5341]"
                    min="100"
                    max="1600"
                    step="1"
                  />
                    <span className="block mt-2 text-sm text-gray-500">
                      Max: 1600 words
                    </span>
                  </div>
                </div>
                </div>

                <button 
                  onClick={handleRunSEOWriter}
                  disabled={isGenerating}
                  className={`w-full bg-[#FF5341] text-white py-3 rounded-lg hover:bg-[#FF5341]/90 transition-colors mt-6 flex items-center justify-center ${
                    isGenerating ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isGenerating ? (
                    <>
                      Generating...
                      <svg className="animate-spin ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </>
                  ) : (
                    <>
                      Run SEO Writer
                      <Play className="w-5 h-5 ml-1 text-white fill-white" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column - Editor Card */}
            <div className="col-span-1 md:col-span-8 space-y-4 md:space-y-6">
              {!showResults && !isGenerating && (
                <div className="bg-[#FFFAF3] rounded-xl p-8 text-center">
                  <p className="text-gray-600 mb-4">
                    Click "Run SEO Writer" to generate your content
                  </p>
                </div>
              )}

              {isGenerating && (
                <div className="bg-[#FFFAF3] rounded-xl p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5341] mx-auto mb-4"></div>
                  <p className="text-gray-600">Generating content...</p>
                </div>
              )}

{showResults && !isGenerating && (
  <div className="bg-[#FFFAF3] rounded-xl p-4 md:p-6">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 mb-4">
      <div className="flex items-center">
        <h3 className="font-medium text-sm md:text-base">Generated Content</h3>
      </div>
      <div className="grid grid-cols-2 md:flex items-center gap-2">
        <button 
          onClick={handleDownload}
          className="p-1.5 rounded-lg text-sm bg-[#FF5341] text-white hover:bg-[#FF5341]/90"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>

    <Editor 
  content={generatedContent} 
  onChange={(html) => {
    if (currentDocumentId) {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
      const timeoutId = setTimeout(() => {
        autoSaveChanges(html);
      }, 5000);
      setAutoSaveTimeout(timeoutId);
    }
  }}
/>

<div className="mt-6 border-t pt-6">
<RegenerationInput
                onRegenerate={handleRegenerate}
                isRegenerating={isRegenerating}
            />
  </div>

  </div>
)}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-4 right-4 ${
          toastType === 'success' ? 'bg-gray-800' : 'bg-red-500'
        } text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in-up z-50`}>
          {toastType === 'success' ? (
            <Check className="w-4 h-4" />
          ) : (
            <X className="w-4 h-4" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default SEOWriter; 