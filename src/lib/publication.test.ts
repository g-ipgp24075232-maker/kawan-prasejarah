import {expect,it} from 'vitest';
import {PUBLICATION_FILE,GITHUB_PUBLIC_DIRECTORY,publicationStatus} from './publication';
it('publishes the same file that every device fetches',()=>{
 expect(PUBLICATION_FILE).toBe('published-site.json');
 expect(GITHUB_PUBLIC_DIRECTORY).toMatch(/\/upload\/main\/public$/);
});
it('distinguishes teacher draft from everyone-visible published version',()=>{
 expect(publicationStatus(false,true)).toBe('draft');
 expect(publicationStatus(true,true)).toBe('draft');
 expect(publicationStatus(false,false)).toBe('public');
 expect(publicationStatus(true,false)).toBe('online');
});
