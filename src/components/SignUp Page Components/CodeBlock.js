import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Box, IconButton, Tooltip } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';

const CodeBlock = ({ codeString, language }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(codeString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Box sx={{ position: 'relative', backgroundColor: '#1e1e1e', borderRadius: 2, padding: 2, overflow: 'auto' }}>
            <SyntaxHighlighter language={language} style={darcula}>
                {codeString}
            </SyntaxHighlighter>
            <Tooltip title={copied ? 'Copied!' : 'Copy'} placement="top">
                <IconButton
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8, color: '#fff' }}
                    onClick={handleCopy}
                >
                    <ContentCopy />
                </IconButton>
            </Tooltip>
        </Box>
    );
};

export default CodeBlock;
