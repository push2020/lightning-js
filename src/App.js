import Blits from '@lightningjs/blits'

// Note: template values are hardcoded literals - see pages/Home.js for why.

export default Blits.Application({
  template: `
    <Element w="1920" h="1080" color="#0B0B0B">
      <RouterView ref="router" w="1920" h="1080" />
    </Element>
  `,
  routes: [{ path: '/', component: () => import('./pages/Home.js') }],
})
