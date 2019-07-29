import React, { useState } from 'react';

import noam from 'noam';
import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';

import './automaton-designer.css';

function getStateFromElement(element: SVGGElement): string {
    return ((element.querySelector('text') as SVGTextElement).textContent as string);
}

function getShapeForState(fsm: any, state: string): string {
    return noam.fsm.isAcceptingState(fsm, state) ? 'doublecircle' : 'circle';
}

function exportAsDotFormat(fsm: any) {
    var result = ["digraph finite_state_machine {", "  rankdir=LR;"];

    result.push(
        Array.from((fsm.states as Array<string>)).map(
            s => s + " [shape = " + getShapeForState(fsm, s) + "]"
        ).join(";")
    );

    if (fsm.initialState) {
        result.push("  secret_node [style=invis, shape=point];");
        var initStateArrow = ["  secret_node ->"];
        initStateArrow.push(fsm.initialState.toString());
        initStateArrow.push("[style=bold];");
        result.push(initStateArrow.join(" "));
    }

    var newTransitions = [];

    var i;
    for (i = 0; i < fsm.transitions.length; i++) {
        var j;
        for (j = 0; j < fsm.transitions[i].toStates.length; j++) {
            var found = null;

            var k;
            for (k = 0; k < newTransitions.length; k++) {
                if (noam.util.areEquivalent(newTransitions[k].fromState, fsm.transitions[i].fromState) &&
                    noam.util.areEquivalent(newTransitions[k].toStates, [fsm.transitions[i].toStates[j]])) {
                    found = newTransitions[k];
                }
            }

            if (found === null) {
                var newTransition = noam.util.clone(fsm.transitions[i]);
                newTransition.toStates = [newTransition.toStates[j]];
                newTransition.symbol = [newTransition.symbol];
                newTransitions.push(newTransition);
            } else {
                found.symbol.push(fsm.transitions[i].symbol);
            }
        }
    }

    var trans;
    for (i = 0; i < newTransitions.length; i++) {
        if (noam.util.areEquivalent(newTransitions[i].toStates[0], fsm.initialState)) {
            trans = [" "];
            trans.push(newTransitions[i].toStates[0].toString());
            trans.push("->");
            trans.push(newTransitions[i].fromState.toString());
            trans.push("[");
            trans.push("label =");
            trans.push('"' + newTransitions[i].symbol.toString() + '"');
            trans.push(" dir = back];");
            result.push(trans.join(" "));
        } else {
            trans = [" "];
            trans.push(newTransitions[i].fromState.toString());
            trans.push("->");
            trans.push(newTransitions[i].toStates[0].toString());
            trans.push("[");
            trans.push("label =");
            trans.push('"' + newTransitions[i].symbol.toString() + '"');
            trans.push(" ];");
            result.push(trans.join(" "));
        }
    }

    result.push("}");

    return result.join("\n").replace(/\$/g, "$");
};

export const AutomatonDesigner: React.FC<{ automaton: any, onUpdate: (automaton: any) => void }> = ({ automaton, onUpdate }) => {
    const [dragState, setDragState] = useState('');

    const automatonParent: React.RefObject<HTMLDivElement> = React.createRef();

    const renderAutomaton = (automaton: any, automatonParent: React.RefObject<HTMLDivElement>) => {
        (new Viz({ Module, render }))
            .renderSVGElement(exportAsDotFormat(automaton))
            .then((svgElement) => {
                if (!automatonParent.current) {
                    return;
                }

                while (automatonParent.current.firstChild) {
                    automatonParent.current.removeChild(automatonParent.current.firstChild);
                }

                const nodes = svgElement.querySelectorAll('.node');
                Array.from(nodes).forEach((e) => {
                    (e as SVGGElement).ondblclick = toggleAcceptState;
                    (e as SVGGElement).onmousedown = dragStart;
                    (e as SVGGElement).onmousemove = drag;
                    (e as SVGGElement).onmouseup = dragEnd;
                });

                automatonParent.current.appendChild(svgElement);
            })
            .catch(error => {
                console.error(error);
            });
    }

    const dragStart = (e: MouseEvent) => {
        if (!e.currentTarget) {
            return;
        }

        const state: string = getStateFromElement((e.currentTarget as SVGGElement));
        setDragState(state);
    }

    const drag = (e: MouseEvent) => {
        // e.preventDefault();
        // TODO: move SVG line around
    }

    const dragEnd = (e: MouseEvent) => {
        if (!e.currentTarget) {
            return;
        }

        const fromState: string = dragState;
        const toState: string = getStateFromElement((e.currentTarget as SVGGElement));

        automaton = { ...automaton };
        noam.fsm.addSymbol(automaton, 'a');
        noam.fsm.addTransition(automaton, fromState, [toState], 'a');

        onUpdate(automaton);
    }

    const toggleAcceptState = (e: Event) => {
        e.stopPropagation();
        if (!e.currentTarget) {
            return;
        }
        const state = getStateFromElement(e.currentTarget as SVGGElement);

        automaton = { ...automaton };
        if (noam.fsm.isAcceptingState(automaton, state)) {
            automaton.acceptingStates = automaton.acceptingStates.filter((e: string) => e !== state);
        } else {
            noam.fsm.addAcceptingState(automaton, state);
        }

        onUpdate(automaton);
    }

    const addNewState = (e: React.MouseEvent) => {
        const state = 's' + automaton.states.length.toString();

        automaton = { ...automaton };
        noam.fsm.addState(automaton, state);
        if (automaton.states.length === 1) {
            noam.fsm.setInitialState(automaton, state);
        }

        onUpdate(automaton);
    }

    renderAutomaton(automaton, automatonParent);

    return (
        <div className="automaton-graph" ref={automatonParent} onDoubleClick={addNewState} />
    );
}