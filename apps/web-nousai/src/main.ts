/**
 * NousAI web application entry: thin bootstrap over the shell library,
 * identical to the stock apps/web entry — the NousAI identity lives in this
 * app's index.html, public assets, and the vite-level brand module swap.
 */
import { AppWebEntry } from '@deepseek-ai/dsh-client-web'

const el = document.getElementById('root')
if (el === null) throw new Error('web app: missing #root')
void new AppWebEntry(el).run()
