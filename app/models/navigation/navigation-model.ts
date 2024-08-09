import type { NavigateOptions } from 'react-router/dist/lib/context';

import { type NavigateFunction, type To } from 'react-router-dom';

import { createEffect, createEvent, restore, sample } from 'effector';
import noop from 'lodash/noop';

type PushParams = { type: 'navigate'; to: To; options?: NavigateOptions } | { type: 'history'; delta: number };

const navigatorChanged = createEvent<NavigateFunction>();
const navigatorPushed = createEvent<PushParams>();

const $navigator = restore(navigatorChanged, noop);

type NavigateParams = {
  navigator: NavigateFunction;
  params: PushParams;
};
const navigateFx = createEffect(({ navigator, params }: NavigateParams) => {
  if (params.type === 'history') {
    navigator(params.delta);
  } else {
    navigator(params.to, params.options);
  }
});

sample({
  clock: navigatorPushed,
  source: $navigator,
  fn: (navigator, params) => ({ navigator, params }),
  target: navigateFx,
});

export const navigationModel = {
  input: {
    navigatorChanged,
    navigatorPushed,
  },
};
