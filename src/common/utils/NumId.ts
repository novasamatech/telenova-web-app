import { useRef } from 'react';

export interface INumId {
  nextId: () => number;
}

export const useNumId = (): INumId => {
  const counter = useRef(0);

  const nextId = (): number => {
    return ++counter.current;
  };

  return {
    nextId,
  };
};
