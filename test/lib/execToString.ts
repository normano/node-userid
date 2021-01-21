import { execSync } from 'child_process';

/**
 * Run a command synchronously and get the output as a string with newlines stripped
 * @param command The command to run
 */
export function execToString(command: string): string {
  return execSync(command).toString().replace('\n', '');
}
