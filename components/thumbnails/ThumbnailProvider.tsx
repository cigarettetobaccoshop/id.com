import type { ReactNode } from 'react';

interface ThumbnailProviderProps { children: ReactNode }

export default function ThumbnailProvider({ children }: ThumbnailProviderProps): JSX.Element {
  return <>{children}</>;
}
