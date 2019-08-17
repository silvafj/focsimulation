import React, { useMemo } from 'react';
import noam from 'noam';
import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';

import './automaton-viewer.css';

function isValidAutomaton(automaton: any): boolean {
    return automaton && automaton.transitions.length > 0;
}

function renderAutomaton(automaton: any, automatonParent: React.RefObject<HTMLDivElement>): void {
    if (!isValidAutomaton(automaton)) {
        return;
    }

    (new Viz({ Module, render }))
        .renderSVGElement(noam.fsm.printDotFormat(automaton))
        .then((svgElement) => {
            if (!automatonParent.current) {
                return;
            }

            while (automatonParent.current.firstChild) {
                automatonParent.current.removeChild(automatonParent.current.firstChild);
            }

            if (isValidAutomaton(automaton)) {
                automatonParent.current.appendChild(svgElement);
            }
        })
        .catch(error => {
            console.error(error);
        });
}

export const AutomatonViewer: React.FC<{ automaton: any }> = ({ automaton }) => {
    const automatonParent: React.RefObject<HTMLDivElement> = React.createRef();

    // Rendering the automaton is done directly and bypasss React reconciliation
    // Avoid rendering if the automaton has not changed
    useMemo(() => renderAutomaton(automaton, automatonParent), [automaton]);

    return (
        <div className="automaton-viewer-container" ref={automatonParent} />
    );
}