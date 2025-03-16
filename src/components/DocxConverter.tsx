import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin } from 'antd';
import { convertDocxToHtmlByUrl } from '../utils/docxConverter';
import type { ConversionResult } from '../utils/docxConverter';
import { FileExclamationOutlined, ReloadOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface DocxConverterProps {
  fileUrl: string;
  className?: string;
}

const DocxConverter: React.FC<DocxConverterProps> = ({ fileUrl, className = '' }) => {
  const [loading, setLoading] = useState(true);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const convertDocument = async () => {
    try {
      setLoading(true);
      console.log('Converting document from URL:', fileUrl);
      
      const result = await convertDocxToHtmlByUrl(fileUrl);
    //   console.log('Conversion result:', {
    //     success: result.success,
    //     hasHtml: !!result.html,
    //     error: result.error,
    //     debugInfo: result.debugInfo
    //   });
      
      setConversionResult(result);
      
      if (result.success) {
        // message.success('מסמך נטען בהצלחה! 📄✨');
      } else {
        throw new Error(result.error || 'Failed to convert document');
      }
    } catch (error) {
      console.error('Error converting document:', error);
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fileUrl) {
      convertDocument();
    }
  }, [fileUrl, retryCount]);

  if (loading) {
    return (
      <Card className={`docx-converter ${className}`}>
        <div className="flex flex-col items-center justify-center py-12">
          <Spin size="large" />
          <Text className="mt-4" style={{ direction: 'rtl' }}>טוען את המסמך שלך... ⚡</Text>
          {import.meta.env.DEV && (
            <Text className="mt-2 text-xs text-gray-400">
              Loading from: {fileUrl}
            </Text>
          )}
        </div>
      </Card>
    );
  }

  if (!conversionResult?.success) {
    return (
      <Card className={`docx-converter ${className}`}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileExclamationOutlined className="text-5xl text-gray-400 mb-4" />
          <Title level={5} className="mb-2" style={{ direction: 'rtl' }}>
            אופס! משהו השתבש 🎭
          </Title>
          <Text className="text-gray-500 max-w-md mb-4" style={{ direction: 'rtl' }}>
            {conversionResult?.error?.includes('404') ?
              'הקובץ לא נמצא. אנא ודאו שהקישור תקין.' :
              conversionResult?.error?.includes('Failed to download') ?
              'לא הצלחנו להוריד את הקובץ. ייתכן שיש בעיה בקישור או בשרת.' :
              'אנחנו מתקשים להציג את המסמך כרגע. אל דאגה - אפשר לנסות שוב!'
            } 
            🌈 ✨
          </Text>
          {import.meta.env.DEV && (
            <Text className="text-xs text-gray-400 mb-4">
              URL: {fileUrl}<br />
              Error: {conversionResult?.error}
            </Text>
          )}
          <button
            onClick={() => setRetryCount(prev => prev + 1)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-light hover:bg-primary-dark text-white rounded-lg transition-colors duration-300"
          >
            נסה שוב
            <ReloadOutlined spin={loading}/>
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div 
      className={`docx-converter ${className}`}
      dangerouslySetInnerHTML={{ __html: conversionResult.html }}
    />
  );
};

export default DocxConverter; 