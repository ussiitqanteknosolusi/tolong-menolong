'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import 'react-quill/dist/quill.snow.css';

// Dynamic import to avoid SSR issues with Quill
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-muted animate-pulse rounded-md" />
});

export default function RichTextEditor({ value, onChange, placeholder }) {
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: function() {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();
          
          const quill = this.quill;

          input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'campaigns');

            try {
              const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
              });
              const data = await res.json();
              
              if (data.success) {
                const range = quill.getSelection();
                quill.insertEmbed(range.index, 'image', data.url);
                // Move cursor to next line
                quill.setSelection(range.index + 1);
              }
            } catch (err) {
              console.error('Image upload failed:', err);
            }
          };
        }
      }
    }
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'align',
    'link', 'image'
  ];

  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-white rounded-md border-input"
      />
      <style jsx global>{`
        .ql-toolbar {
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
            border-color: hsl(var(--input)) !important;
        }
        .ql-container {
            border-bottom-left-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
            border-color: hsl(var(--input)) !important;
            min-height: 200px;
        }
        .ql-editor {
            min-height: 200px;
        }
      `}</style>
    </div>
  );
}
