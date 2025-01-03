// src/pages/DocumentManagement.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Shared/Sidebar';
import { 
  Bell, 
  MenuIcon,
  Search,
  Filter,
  Upload,
  Download,
  Trash2,
  Eye,
  FileText,
  FileCheck2,
  Bot,
  Wrench,
  File,
  MoreVertical,
  Plus
} from 'lucide-react';

// Document type icons mapping
const documentTypeIcons = {
  'Uploaded': FileText,
  'SEO Writer': Wrench,
  'AI Writer': Bot,
  'Custom Template': File,
  'Compliance AI': FileCheck2
};

const DocumentCard = ({ document, onView, onDownload, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const IconComponent = documentTypeIcons[document.type] || FileText;

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <div className="bg-[#FF5341] bg-opacity-10 p-2 rounded-lg">
            <IconComponent className="w-5 h-5 text-[#FF5341]" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">{document.name}</h3>
            <p className="text-sm text-gray-500">{document.date}</p>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10">
              <button
                onClick={() => {
                  onView(document);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </button>
              <button
                onClick={() => {
                  onDownload(document);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
              <button
                onClick={() => {
                  onDelete(document);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{document.size}</span>
        <span className={`px-2 py-1 rounded-full text-xs ${
          document.type === 'Uploaded' ? 'bg-blue-100 text-blue-700' :
          document.type === 'SEO Writer' ? 'bg-purple-100 text-purple-700' :
          document.type === 'AI Writer' ? 'bg-green-100 text-green-700' :
          document.type === 'Custom Template' ? 'bg-orange-100 text-orange-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {document.type}
        </span>
      </div>
    </div>
  );
};

const DocumentTypeFilter = ({ types, selectedType, onSelect }) => (
  <div className="flex flex-wrap gap-2">
    <button
      onClick={() => onSelect(null)}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        !selectedType
          ? 'bg-[#FF5341] text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      All
    </button>
    {types.map((type) => (
      <button
        key={type}
        onClick={() => onSelect(type)}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          selectedType === type
            ? 'bg-[#FF5341] text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        {type}
      </button>
    ))}
  </div>
);

const DocumentManagement = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'How to Build a Successful Startup.docx',
      type: 'AI Writer',
      date: 'Mar 15, 2024',
      size: '2.4 MB'
    },
    {
      id: 2,
      name: 'SEO Strategy 2024.pdf',
      type: 'SEO Writer',
      date: 'Mar 14, 2024',
      size: '1.8 MB'
    },
    {
      id: 3,
      name: 'Content Guidelines.pdf',
      type: 'Uploaded',
      date: 'Mar 13, 2024',
      size: '3.2 MB'
    },
    {
      id: 4,
      name: 'Marketing Campaign Template.docx',
      type: 'Custom Template',
      date: 'Mar 12, 2024',
      size: '1.5 MB'
    },
    {
      id: 5,
      name: 'Compliance Report Q1.pdf',
      type: 'Compliance AI',
      date: 'Mar 11, 2024',
      size: '4.1 MB'
    }
  ]);

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

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Filter documents based on search query
  };

  const handleUpload = () => {
    // Handle document upload
  };

  const handleView = (document) => {
    // Handle document view
  };

  const handleDownload = (document) => {
    // Handle document download
  };

  const handleDelete = (document) => {
    // Handle document deletion
  };

  const documentTypes = ['Uploaded', 'SEO Writer', 'AI Writer', 'Custom Template', 'Compliance AI'];
  const filteredDocuments = documents.filter(doc => 
    (!selectedType || doc.type === selectedType) &&
    (!searchQuery || doc.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-[#FF5341] rounded-full"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Management</h1>
              <p className="text-gray-600">Manage all your documents in one place</p>
            </div>
            <button
              onClick={handleUpload}
              className="bg-[#FF5341] text-white px-4 py-2 rounded-lg hover:bg-[#FF5341]/90 transition-colors flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </button>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="w-full md:w-96 relative">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF5341]"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              <div className="flex items-center">
                <Filter className="w-5 h-5 text-gray-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
              </div>
            </div>
            <DocumentTypeFilter
              types={documentTypes}
              selectedType={selectedType}
              onSelect={setSelectedType}
            />
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onView={handleView}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentManagement;