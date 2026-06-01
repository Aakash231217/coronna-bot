'use client'
import Section from '@/components/section-label'
import { useToast } from '@/components/ui/use-toast'
import { Copy } from 'lucide-react'
import React from 'react'

type Props = {
  id: string
}

const CodeSnippet = ({ id }: Props) => {
  const { toast } = useToast()
  const baseUrl =
    (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(
      /\/$/,
      ''
    )
  let snippet = `
    const iframe = document.createElement("iframe");

    const iframeStyles = (styleString) => {
      const style = document.createElement('style');
      style.textContent = styleString;
      document.head.append(style);
    };

    iframeStyles(\`
      .chat-frame {
        position: fixed;
        bottom: 50px;
        right: 50px;
        left: auto;
        border: none;
      }
    \`);

    iframe.src = "${baseUrl}/chatbot";
    iframe.classList.add('chat-frame');
    document.body.appendChild(iframe);

    // Behavior tracker — auto-open bot when user looks stuck
    let lastActivity = Date.now();
    let proactiveSent = false;
    let exitFired = false;
    const resetActivity = () => { lastActivity = Date.now(); };
    ['mousemove','scroll','keydown','click','touchstart'].forEach((ev) =>
      window.addEventListener(ev, resetActivity, { passive: true })
    );

    const sendProactive = (reason) => {
      if (proactiveSent) return;
      proactiveSent = true;
      try {
        iframe.contentWindow.postMessage(
          JSON.stringify({
            type: 'bot:proactive',
            reason: reason,
            path: window.location.pathname,
            title: document.title,
          }),
          "${baseUrl}/"
        );
      } catch (e) {}
    };

    setInterval(() => {
      if (proactiveSent) return;
      if (Date.now() - lastActivity > 25000) sendProactive('idle');
    }, 5000);

    document.addEventListener('mouseleave', (e) => {
      if (e.clientY < 5 && !exitFired) {
        exitFired = true;
        sendProactive('exit-intent');
      }
    });

    window.addEventListener("message", (e) => {
      if (e.origin !== "${baseUrl}") return null;
      let dimensions = JSON.parse(e.data);
      iframe.width = dimensions.width;
      iframe.height = dimensions.height;
      if (dimensions.position === 'left') {
        iframe.style.left = '50px';
        iframe.style.right = 'auto';
      } else {
        iframe.style.right = '50px';
        iframe.style.left = 'auto';
      }
      iframe.contentWindow.postMessage("${id}", "${baseUrl}/");
    });
        `

  return (
    <div className="mt-10 flex flex-col gap-5 items-start">
      <Section
        label="Code snippet"
        message="Copy and paste this code snippet into the header tag of your website"
      />
      <div className="bg-cream px-10 rounded-lg inline-block relative">
        <Copy
          className="absolute top-5 right-5 text-gray-400 cursor-pointer"
          onClick={() => {
            navigator.clipboard.writeText(snippet)
            toast({
              title: 'Copied to clipboard',
              description: 'You can now paste the code inside your website',
            })
          }}
        />
        <pre>
          <code className="text-gray-500">{snippet}</code>
        </pre>
      </div>
    </div>
  )
}

export default CodeSnippet
