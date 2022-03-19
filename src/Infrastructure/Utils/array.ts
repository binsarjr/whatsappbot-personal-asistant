/**
 * count duplicate value in an array in javascript
 * @param arr
 * @returns [object]
 */
export const countOfUnique = function <T>(arr: T[]) {
    return arr.reduce(function (prev: any, cur) {
        prev[cur] = (prev[cur] || 0) + 1
        return prev
    }, {})
}

/**
 * Creating chunk with Iterator
 * @param arr Data chunk
 * @param n size of chunk
 */
export const chunksIterator = function <T>(arr: T[], size: number) {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
    )
}

/**
 * Creating chunk with generator
 * @param arr Data chunk
 * @param n size of chunk
 */
export const chunks = function* <T>(
    arr: T[],
    n: number
): Generator<T[], void, unknown> {
    for (let i = 0; i < arr.length; i += n) {
        yield arr.slice(i, i + n)
    }
}

/**
 * Shuffle array
 * @param arr data to be shuffled
 * @returns shuffled
 */
export const shuffle = <T>(arr: T[]) => {
    arr.sort(() => 0.5 - Math.random())
    return arr
}

type Iterableify<T> = { [K in keyof T]: Iterable<T[K]> }

export function* product<T extends Array<unknown>>(
    ...iterables: Iterableify<T>
): Generator<T> {
    if (iterables.length === 0) {
        return
    }
    const iterators = iterables.map((it) => it[Symbol.iterator]())
    const results = iterators.map((it) => it.next())

    // Cycle through iterators
    for (let i = 0; ; ) {
        if (results[i].done) {
            // Reset the current iterator
            iterators[i] = iterables[i][Symbol.iterator]()
            results[i] = iterators[i].next()
            // Advance and exit if we've reached the end
            if (++i >= iterators.length) {
                return
            }
        } else {
            yield results.map(({ value }) => value) as T
            i = 0
        }
        results[i] = iterators[i].next()
    }
}
