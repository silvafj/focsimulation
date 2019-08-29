import React from 'react';
import { Icon, Popover } from 'antd';

const Title = (
  <span>What is a regular expression?</span>
);

const Content = (
  <div>
    <p>
A regular expression (over an alphabet Σ) is a string consisting of symbols from Σ, plus symbols from the list
      <em>+</em>
,
      <em>*</em>
,
      <em>(</em>
,
      <em>)</em>
,
      <em>$</em>
.
    </p>
    <ul>
      <li>
        <strong>+</strong>
        {' '}
(alteration operator, ∪)
      </li>
      <li>
        <strong>∗</strong>
        {' '}
(Kleene star); 0 or more symbols
      </li>
      <li>
        <strong>(</strong>
; start grouping
      </li>
      <li>
        <strong>)</strong>
; end grouping
      </li>
      <li>
        <strong>$</strong>
        {' '}
(epsilon, ε); empty string
      </li>
      <li>
        <strong>\</strong>
        {' '}
(backslash); used for escaping the special meaning of all the listed characters, including backslash itself
      </li>
    </ul>

    <p>
Example:
      <code>a(a+b)*</code>
    </p>
    <p>
= all words starting with a, followed by any word over
      {'{a, b}'}
    </p>
    <p>
= all words over the alphabet
      {'{a, b}'}
      {' '}
starting with a
    </p>
  </div>
);

export const ExpressionHelp = (
  <Popover
    placement="rightTop"
    title={Title}
    content={Content}
  >
    <Icon type="question-circle" style={{ color: 'rgba(0,0,0,.45)' }} />
  </Popover>
);
