import Navbar from '../Navbar/Navbar'
import React, { useState, useRef } from 'react';
import GenerateMailCards from './GenerateMailCards';
import { useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import './GenerateMAil.css';
import axios from 'axios';

const GenerateMail = () => {
  const navigate = useNavigate();
  const [previewSource, setPreviewSource] = useState('');
  const [apiData, setApiData] = useState('');
  const [pdfText, setPdfText] = useState('');
  const [mail, setMail] = useState('');

  const [manuallyEnteredData, setManuallyEnteredData] = useState('');
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleFileInputChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (fileExtension === 'pdf') {
        const previewURL = URL.createObjectURL(file);
        setPreviewSource(previewURL);
        const text = await extractPdfText(file);
        setPdfText(text);
      } else {
        alert('Invalid file format. Only PDF documents are allowed.');
      }
    }
  };

  const extractPdfText = async (file) => {
    try {
      const typedarray = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjs.getDocument(typedarray).promise;
      const page = await pdf.getPage(1);
      const content = await page.getTextContent();
      const text = content.items.map((item) => item.str).join(' ');
      return text;
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      return '';
    }
  };

  const clearFileInput = () => {
    setPreviewSource('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setPdfText('');
  };

  const handleGenerateMail = async () => {
    const generatedMail = await generateMail();
    setApiData(generatedMail);

    if (textareaRef.current) {
      textareaRef.current.value = generatedMail;
    }
  };

  // const generateMail = async () => {
  //   const API_KEY = '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';
  //   const profile = 'Software_Engineer';
  //   const prompt = `Write a cold mail for a job post of ${profile}.\n\nPDF Text:\n${pdfText}\n\nManually Entered Data:\n${manuallyEnteredData}`;

  //   try {
  //     const payload = {
  //       prompt: prompt,
  //       temperature: 0,
  //       model: 'text-davinci-003'
  //     };

  //     const response = await axios.post('https://api.openai.com/v1/completions', payload, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${API_KEY}`
  //       }
  //     });

  //     console.log(response.data);
  //     setMail(response.data);
  //   } catch (error) {
  //     console.error('Error generating mail:', error);
  //   }
  // };

  const generateMail = async () => {
    const API_KEY = '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';
    const profile = 'Software_Engineer';
    const prompt = `Write a cold mail for a job post of ${profile}.\n\nPDF Text:\n${pdfText}\n\nManually Entered Data:\n${manuallyEnteredData}`;
  
    try {
      const payload = {
        prompt: prompt,
        temperature: 0,
        model: 'text-davinci-003'
      };
  
      const response = await axios.post('https://api.openai.com/v1/completions', payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`
        }
      });
  
      const generatedMail = response.data.choices[0].text;
      console.log(generatedMail);
      return generatedMail;
    } catch (error) {
      return '';
    }
  };
  







  const handleGoBack = () => {
    navigate('/resumeselect');
  };

  const handleTextareaChange = (event) => {
    setManuallyEnteredData(event.target.value);
  };

  return (
    <>
      <Navbar />
      <button onClick={handleGoBack}>Go Back</button>
      <div className="maincontainer">
        <div className="input-1">
          <span>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileInputChange}
              ref={fileInputRef}
              id="file-input"
            />
            <label htmlFor="file-input">Choose File</label>
          </span>
          {previewSource && (
            <div>
              <iframe title="Preview" src={previewSource} style={{ width: '100%', height: '500px' }} />
              <button onClick={clearFileInput} className="clear">
                Clear
              </button>
            </div>
          )}
        </div>
        <div className="input-2">
          <textarea
            className="textarea-input"
            placeholder="Paste or enter text here"
            ref={textareaRef}
            onChange={handleTextareaChange}
          ></textarea>
        </div>
      </div>
      <button className="generate" onClick={handleGenerateMail}>
        Generate Mail
      </button>

      <GenerateMailCards apiData={apiData} />
    </>
  );
};

export default GenerateMail;
