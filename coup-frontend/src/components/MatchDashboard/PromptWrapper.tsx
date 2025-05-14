import React from 'react';

interface PromptWrapperProps {
  /** Current action prompt text or options */
}

 /**
  * Contains the prompt UI where players choose actions or responses.
  */
const PromptWrapper: React.FC<PromptWrapperProps> = () => {
  return (
    <div id="prompt-wrapper">
      {/* TODO: render action prompt and buttons */}
    </div>
  );
};

export default PromptWrapper;
