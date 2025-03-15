import React, { useState, useRef } from 'react';
import { Card, Typography, Checkbox, message, Spin } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { convertDocxToHtml } from '../utils/docxConverter';
import type { ConversionResult } from '../utils/docxConverter';

const { Title, Text } = Typography;

interface DocxRendererProps {
  className?: string;
}

const DocxRenderer: React.FC<DocxRendererProps> = ({ className = '' }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [showLogs, setShowLogs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [hasFile, setHasFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      await processFile(file);
    } else {
      message.error('Please drop a valid .docx file 📝');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setLoading(true);
    try {
      const result = await convertDocxToHtml(file);
      setConversionResult(result);
      
      if (result.success) {
        setHtmlContent(result.html);
        setHasFile(true);
        message.success('File converted successfully! 🎉');
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      message.error(
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🤔</div>
          <div>Oops! Something went wrong while processing your file.</div>
          <div>Let's try that again, shall we? 🌟</div>
        </div>
      );
      setHasFile(false);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const renderDropZone = () => (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary-light dark:hover:border-primary-dark transition-colors duration-300"
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <InboxOutlined className="text-4xl text-gray-400 mb-4" />
      <Title level={5} className="mb-2">Drop your DOCX file here</Title>
      <Text className="text-gray-500">
        or <span className="text-primary-light dark:text-primary-dark">click to upload</span>
      </Text>
      <Text className="block text-gray-400 text-sm mt-2">
        Supports .docx files only
      </Text>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Spin size="large" />
          <Text className="mt-4">Processing your document... ⚡</Text>
        </div>
      );
    }

    if (!hasFile) {
      return renderDropZone();
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Checkbox
            checked={showLogs}
            onChange={(e) => setShowLogs(e.target.checked)}
          >
            Show processing logs
          </Checkbox>
          <button
            onClick={() => {
              setHasFile(false);
              setHtmlContent('');
              setConversionResult(null);
            }}
            className="text-primary-light dark:text-primary-dark hover:underline"
          >
            Upload another file
          </button>
        </div>
        
        <div className="docx-viewer-container">
          <div
            className="docx-viewer"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
          
          {showLogs && conversionResult?.logs && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Title level={5} className="mb-3">Processing Logs</Title>
              <div className="max-h-60 overflow-y-auto font-mono text-sm">
                {conversionResult.logs.map((log, index) => (
                  <div
                    key={index}
                    className={`py-1 ${
                      log.includes('STEP') ? 'text-blue-600 dark:text-blue-400 font-bold' :
                      log.includes('Success') ? 'text-green-600 dark:text-green-400' :
                      log.includes('Error') || log.includes('Not Found') ? 'text-red-600 dark:text-red-400' :
                      'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className={`docx-renderer ${className}`}>
      {renderContent()}
    </Card>
  );
};

export default DocxRenderer; 