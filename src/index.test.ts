import postcss from 'postcss'
import plugin from './index'

async function run(input: string): Promise<string> {
    const result = await postcss([plugin]).process(input, { from: undefined })
    return result.css
}

const screens = `
@screens {
  pa-mob-ver: (max-width: 30em) and (orientation: portrait);
  pa-tab-hor: (max-width: 64em) and (orientation: landscape);
}
`

describe('screen-adapt', () => {
    test('valid config — compiles known screen to @media', async () => {
        const input = screens + `
.hero {
  width: 800px;
  @pa-mob-ver {
    width: 100vw;
  }
}`
        const output = await run(input)
        expect(output).toContain('@media (max-width: 30em) and (orientation: portrait)')
        expect(output).toContain('width: 100vw')
        expect(output).not.toContain('@pa-mob-ver')
        expect(output).not.toContain('@screens')
    })

    test('unknown screen names — passes through untouched', async () => {
        const input = screens + `
.hero {
  width: 800px;
  @pa-unknown {
    width: 100vw;
  }
}`
        const output = await run(input)
        expect(output).toContain('@pa-unknown')
    })

    test('nested selectors — hoists @media correctly', async () => {
        const input = screens + `
.parent .child {
  font-size: 16px;
  @pa-mob-ver {
    font-size: 14px;
  }
}`
        const output = await run(input)
        expect(output).toContain('@media (max-width: 30em) and (orientation: portrait)')
        expect(output).toContain('.parent .child')
        expect(output).toContain('font-size: 14px')
    })

    test('multiple screens per selector — compiles all variants', async () => {
        const input = screens + `
.hero {
  width: 800px;
  @pa-mob-ver {
    width: 100vw;
  }
  @pa-tab-hor {
    width: 90vw;
  }
}`
        const output = await run(input)
        expect(output).toContain('@media (max-width: 30em) and (orientation: portrait)')
        expect(output).toContain('@media (max-width: 64em) and (orientation: landscape)')
        expect(output).toContain('width: 100vw')
        expect(output).toContain('width: 90vw')
    })
})