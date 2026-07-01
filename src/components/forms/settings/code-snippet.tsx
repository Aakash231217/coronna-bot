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
  let snippet = `<script>
(function () {
  function initCorinnaBot() {
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
    // Allow the embedded widget to speak (autoplay) and listen (microphone)
    iframe.allow = "microphone; autoplay; clipboard-write";
    iframe.setAttribute('allowtransparency', 'true');
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
          "${baseUrl}"
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

    const applyLayout = (dimensions) => {
      if (dimensions.position === 'full') {
        // Mobile: let the widget take over the whole screen.
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.right = 'auto';
        iframe.style.bottom = 'auto';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.width = String(window.innerWidth);
        iframe.height = String(window.innerHeight);
      } else {
        // Desktop: floating card / launcher in the corner.
        iframe.style.top = 'auto';
        iframe.style.bottom = '50px';
        iframe.style.width = dimensions.width + 'px';
        iframe.style.height = dimensions.height + 'px';
        iframe.width = dimensions.width;
        iframe.height = dimensions.height;
        if (dimensions.position === 'left') {
          iframe.style.left = '50px';
          iframe.style.right = 'auto';
        } else {
          iframe.style.right = '50px';
          iframe.style.left = 'auto';
        }
      }
    };

    let lastDimensions = null;
    window.addEventListener("message", (e) => {
      if (e.origin !== "${baseUrl}") return null;
      lastDimensions = JSON.parse(e.data);
      applyLayout(lastDimensions);
      iframe.contentWindow.postMessage("${id}", "${baseUrl}");
    });

    // Keep a full-screen (mobile) widget correct on rotate / resize.
    window.addEventListener('resize', () => {
      if (lastDimensions && lastDimensions.position === 'full') applyLayout(lastDimensions);
    });
  }

  // Wait for the DOM so document.body exists (safe in <head> or <body>).
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCorinnaBot);
  } else {
    initCorinnaBot();
  }
})();
</script>`

  return (
    <div className="mt-10 flex flex-col gap-5 items-start">
      <Section
        label="Code snippet"
        message="Copy and paste this snippet into your website's HTML — inside <head> or just before the closing </body> tag. Works the same for chat, voice, or both."
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
