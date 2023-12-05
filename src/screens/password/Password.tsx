'use client';
import { useState, FormEvent } from 'react';
import { getKeyringPair } from '@common/wallet';
import { KeyringPair } from '@polkadot/keyring/types';

interface PasswordPageProps {
  onResolve: (keypair: KeyringPair) => void;
  onReject: () => void;
}

export const PasswordPage = ({ onResolve, onReject }: PasswordPageProps) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const keyringPair = getKeyringPair(password);

    if (keyringPair === undefined) {
      alert('Wrong password!');
    } else {
      onResolve(keyringPair);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Enter password:
          <input
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit" className="btn btn-blue mt-4">
          Submit
        </button>
      </form>
      <button className="btn btn-blue mt-4" onClick={onReject}>
        Back
      </button>
    </div>
  );
};
