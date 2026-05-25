import React from 'react'
import ReactMarkdown from "react-markdown"
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism'

// Define proper props type
interface MarkdownRendererProps {
    content: string
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    // Don't render if content is empty
    if (!content) {
        return null
    }

    return (
        <div className="markdown-body text-neutral-700">
            <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                components={{
                    h1: ({ node, ...props }) => <h1 className='text-2xl font-bold my-4' {...props} />,
                    h2: ({ node, ...props }) => <h2 className='text-xl font-semibold my-3' {...props} />,
                    h3: ({ node, ...props }) => <h3 className='text-lg font-medium my-2' {...props} />,
                    h4: ({ node, ...props }) => <h4 className='text-md font-medium my-2' {...props} />,
                    p: ({ node, ...props }) => <p className='my-2 text-slate-700' {...props} />,
                    a: ({ node, ...props }) => <a className='text-[#00d492] underline hover:text-[#00b87a] transition-colors' target='_blank' rel='noopener noreferrer' {...props} />,
                    ul: ({ node, ...props }) => <ul className='list-disc list-inside my-2 space-y-1' {...props} />,
                    ol: ({ node, ...props }) => <ol className='list-decimal list-inside my-2 space-y-1' {...props} />,
                    li: ({ node, ...props }) => <li className='my-1' {...props} />,
                    strong: ({ node, ...props }) => <strong className='font-bold text-slate-800' {...props} />,
                    em: ({ node, ...props }) => <em className='italic' {...props} />,
                    blockquote: ({ node, ...props }) => <blockquote className='border-l-4 border-emerald-300 pl-4 italic text-slate-600 my-4' {...props} />,
                    code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '')
                        const codeContent = String(children).replace(/\n$/, '')
                        
                        if (!inline && match) {
                            return (
                                <SyntaxHighlighter 
                                    style={dracula} 
                                    language={match[1]} 
                                    PreTag="div"
                                    customStyle={{
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        marginTop: '0.5rem',
                                        marginBottom: '0.5rem'
                                    }}
                                    {...props}
                                >
                                    {codeContent}
                                </SyntaxHighlighter>
                            )
                        }
                        
                        return (
                            <code className={`${className || ''} bg-neutral-100 px-1.5 py-0.5 rounded font-mono text-sm text-emerald-700`} {...props}>
                                {children}
                            </code>
                        )
                    },
                    pre: ({ node, ...props }) => <pre className='bg-neutral-900 p-3 rounded-lg overflow-x-auto my-4' {...props} />
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}

export default MarkdownRenderer