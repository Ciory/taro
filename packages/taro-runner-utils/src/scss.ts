import { Bundler, BundleResult } from 'scss-bundle'

interface LoaderOption {
  data?: string
  [key: string]: any
}

interface BuildConfig {
  sass?: {
    resource?: string | string[]
    projectDirectory?: string
    data?: string
  }
  sassLoaderOption?: LoaderOption
}

/**
 * Return bundled sass content.
 * 
 * @param {string} url Absolute file path.
 * @param {(string | undefined)} projectDirectory Absolute project location, where node_modules are located. Used for resolving tilde imports.
 * @returns Bundle result.
 */
export async function getBundleResult(url: string, 
    projectDirectory: string | undefined = undefined
  ): Promise<BundleResult> {
  let bundler: Bundler = new Bundler()
  if (projectDirectory) {
    bundler = new Bundler(undefined, projectDirectory)
  }
  const res = await bundler.bundle(url)
  return res
}

export async function getBundleContent(resource: string | string[],
  projectDirectory: string | undefined = undefined
): Promise<string | undefined> {
  let result: string | undefined = ''

  try {
    if (typeof resource === 'string') {
      const res = await getBundleResult(resource, projectDirectory)
      result = res.bundledContent
    }

    if (Array.isArray(resource)) {
      for (const url of resource) {
        const res = await getBundleResult(url, projectDirectory)
        result += res.bundledContent || ''
      }
    }
  } catch (error) {
    throw new Error(error)
  }

  return result
}

export async function getSassLoaderOption(
  { sass, sassLoaderOption }: BuildConfig
): Promise<LoaderOption> {
  sassLoaderOption = sassLoaderOption || {}

  let bundledContent: string = ''

  if (!sass) {
    return sassLoaderOption
  }

  const { resource, projectDirectory } = sass
  if (resource) {
    const content = await getBundleContent(resource, projectDirectory)
    bundledContent += content
  }

  if (sass.data) {
    bundledContent += sass.data
  }
  return {
    ...sassLoaderOption,
    data: sassLoaderOption.data ? `${sassLoaderOption.data}${bundledContent}` : bundledContent
  }
}

export default getSassLoaderOption
