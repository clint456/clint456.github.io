hexo.extend.filter.register('theme_inject', function(injects) {
    // injects.header.file('default', 'source/_inject/test1.ejs', { key: 'value' }, { cache: true }, -1);
    injects.head.raw('default', '<meta name="google-site-verification" content="LDVzDqoNN-3KiWUvQ5pvbOHGg42nOAbnOVtSdKELE4Y" />');
    injects.head.raw('default', '<meta name="msvalidate.01" content="72C6B867109C2AEE7D3513EF00C253D7" />');

  });