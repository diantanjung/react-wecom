import { useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { PrismLight as SyntaxHighlighter, SyntaxHighlighterProps } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyIcon, PasteIcon } from '../../assets/icon';
import "./Code.css";


type CodeBlockProps = {
    children: string;
    language: string;
}

const Code = ({ children, language, ...props }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCopied(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <div className="code">
      <CopyToClipboard text={children} onCopy={() => setCopied(true)}>
        <button className='btn btn-sm icon copy-icon'>
          {copied ? <i className="fa fa-clipboard"></i> : <i className="fa fa-copy"></i>}
        </button>
      </CopyToClipboard>
      <SyntaxHighlighter
        {...props}
        children={String(children).replace(/\n$/, '')}
        language={language}
        style={materialDark}
        PreTag="div"
      />
    </div>
  )
}

export default Code