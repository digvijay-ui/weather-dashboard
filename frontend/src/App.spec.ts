import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import App from './App.vue'

describe('App', () => {
  it('renders the Weather Dashboard project name', () => {
    const wrapper = mount(App)

    expect(wrapper.text()).toContain('Weather Dashboard')
  })
})
