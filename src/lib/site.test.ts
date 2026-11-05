import {expect,it} from 'vitest';
import {sanitizeSite} from './site';
import {DEFAULT_SITE} from '../data/site';
it('loads defaults when old backups do not contain a design',()=>{
  const value=sanitizeSite(undefined);
  expect(value.heroBefore).toBe(DEFAULT_SITE.heroBefore);
  expect(value.showCamera).toBe(true);
});
it('migrates a previous avatar background to the design',()=>{
  const image='data:image/png;base64,aGVsbG8=';
  expect(sanitizeSite(undefined,image).backgroundImage).toBe(image);
});
it('preserves valid custom text and colors, rejects invalid image/css',()=>{
  const site=sanitizeSite({heroBefore:'Selamat pagi',accentColor:'#123abc',
    backgroundColor:'url(evil)',backgroundImage:'javascript:alert(1)',fontScale:10000,
    artLeft:{image:'http://remote/image',left:-200,top:22,width:800,opacity:101}});
  expect(site.heroBefore).toBe('Selamat pagi');
  expect(site.accentColor).toBe('#123abc');
  expect(site.backgroundColor).toBe(DEFAULT_SITE.backgroundColor);
  expect(site.backgroundImage).toBe('');
  expect(site.fontScale).toBe(140);
  expect(site.artLeft.left).toBe(0);
  expect(site.artLeft.image).toBe('');
});
