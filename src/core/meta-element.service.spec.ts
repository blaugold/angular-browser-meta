import { TestBed } from '@angular/core/testing'
import { MetaElementService, MetaElementDefinition } from './.'

describe('MetaElementService', () => {
  let metaElement: MetaElementService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MetaElementService
      ]
    });

    metaElement = TestBed.get(MetaElementService)
  });

  it('should support adding and getting tags', () => {
    const metaDef: MetaElementDefinition = {
      id: 'add',
      name: 'add',
      content: 'add'
    };
    metaElement.add(metaDef);
    const el = metaElement.getMetaElement('id="add"');
    expect(el.name).toEqual('add');
    expect(el.content).toEqual('add');
  });

  it('should support removing tags', () => {
    const metaDef: MetaElementDefinition = {
      id: 'remove',
    };
    metaElement.add(metaDef);
    metaElement.remove('id="remove"');
    const el = metaElement.getMetaElement('id="remove"');
    expect(el).toBeNull();
  });

  it('should support updating tags', () => {
    const metaDef: MetaElementDefinition = {
      id: 'update',
      name: 'before'
    };
    metaElement.add(metaDef);
    metaElement.update('id="update"', { content: 'after' });
    const el = metaElement.getMetaElement('id="update"');
    expect(el.name).toEqual('before');
    expect(el.content).toEqual('after');
  });

  it('should support setting tags', () => {
    const metaDef: MetaElementDefinition = {
      id: 'set',
      name: 'before',
      content: 'c',
    };
    metaElement.add(metaDef);
    metaElement.set('id="set"', { id: 'set', name: 'after' });
    const el = metaElement.getMetaElement('id="set"');
    expect(el.name).toEqual('after');
    expect(el.content).toBe('');
  });
});