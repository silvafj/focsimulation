import React from 'react';
import { Input } from 'antd';
import noam from 'noam';

import './test-words.css';

function isValidAutomaton(automaton: any): boolean {
  return automaton && automaton.transitions.length > 0;
}

function renderResultsHTML(automaton: any, words: Array<string>, expected: boolean): string {
  const results: Array<string> = [];

  if (!isValidAutomaton(automaton)) {
    return '';
  }

  for (const str of words) {
    let strState: string = expected ? 'invalid' : 'valid';

    try {
      if (noam.fsm.isStringInLanguage(automaton, str)) {
        strState = expected ? 'valid' : 'invalid';
      }
    } catch {
      //
    }

    results.push(`<span class="${strState}">${str}</span>`);
  }

  return results.join('');
}

export const TestWords: React.FC<{
    automaton: any;
    words: Array<string>;
    testAccept: boolean;
    onChange?: (words: Array<string>) => void;
}> = ({
  automaton, words, testAccept, onChange,
}) => {
  const testType: string = (testAccept ? 'Accept' : 'Reject');

  return (
    <div className={`test-words ${testType.toLowerCase()}`}>
      <h2>{testType}</h2>

      <div className="container">
        <div className="backdrop">
          <div
            className="highlights"
            dangerouslySetInnerHTML={{
              __html:
                            renderResultsHTML(automaton, words, testAccept),
            }}
          />
        </div>
        <Input.TextArea
          rows={8}
          value={words.join('\n')}
          onChange={(e) => {
            if (onChange) {
              onChange(e.target.value.split('\n'));
            }
          }}
        />
      </div>
    </div>
  );
};
