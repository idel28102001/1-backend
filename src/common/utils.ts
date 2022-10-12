import { config } from './config';
import * as crypto from 'crypto';

export const getFrontendUrl = (options: {
  pathname: string;
  params?: Record<string, any>;
}) => {
  const params =
    options.params && new URLSearchParams(options.params).toString();
  return (
    config.getFrontendUrl() + options.pathname + (params ? `?${params}` : '')
  );
};

export const generateHash = (length = 40): string => {
  return crypto.randomBytes(length).toString('hex');
};

export const getRandomNumInRange = (min = 100_000, max = 1_000_000): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const deferredRequest = async <T = any>(
  func: Promise<T>,
  delay = 2000,
): Promise<T> => {
  return await new Promise((resolve) => {
    setTimeout(async () => {
      resolve(await func);
    }, delay);
  });
};
