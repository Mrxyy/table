import { loader } from '@monaco-editor/react';
import { useEffect } from 'react';

const cleanURL = (str: string) => {
  return str.replace(/([^:])(\/\/+)/g, '$1/');
};

export function useLoadMonacoEditor(basename: string) {
  useEffect(() => {
    const loaded = loader.__getMonacoInstance();
    if (loaded) {
      return;
    }

    console.log('loading monaco for @devtable/settings-form');
    const path = cleanURL(basename + '/assets/monaco-editor/min/vs');
    loader.config({ paths: { vs: path } });
    loader.init().then((monaco) => console.log('monaco instance:', monaco));
  }, []);
}
