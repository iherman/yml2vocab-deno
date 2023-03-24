# Generate RDFS Vocabulary files from YAML — Deno version

This repository contains  [`deno`](https://deno.land) version of the [yml2vocab](https://github.com/w3c/yml2vocab) project, which is
based on the more traditional Typescript (i.e., `tsc` or `ts-node`) environment on top of [node.js](https://nodejs.org/en).

The only reason I did this was to experiment with `deno`. Whilst `deno` is still a moving target, I see lots of potential 
in it, and I wanted to try out, through a slightly more complicated example, what the differences are. This note is
mostly for myself, but by putting it into a public repository, others may also see it and may find it useful.

Note that I tried to harmonize the Typescript code of the two project as much as I could by also retrofitting, when
possible, the somewhat stricter Typescript code requirements to the original project.

Here are the differences/observations:

- `deno` uses a stricter typescript compiler than `tsc/node.js`. For example, it frowns upon the usage of `any` and forces the user to use something more precise, e.g., `unknown` or a `Record<...,...>`. This is actually a good thing!

- It is still a bit messy to load/use `npm` or `node` modules from within `deno`. It has improved a lot, so it _is_ possible to use, for example, the `fs` module of `node.js` by doing an import using, for example, `node:fs`, or loading `npm` packages via, say, `npm:commander`. It does mean to modify the original code, however, insofar as `tsc/node.js`, though it now understands `node:fs`, does not understand `npm:commander`. I would hope that `node.js` will eventually implement the `npm:...` syntax as a compatibility measure.
  
- `deno` requires the `.ts` suffix when referring to local Typescript modules. I understand that this is a "proper" way of doing things because `deno` relies on using URLs in import statements, and that is the "correct" way for file URLs in this case. But it is nevertheless irritating, because it brings in a tiny, totally unnecessary difference between a code destined to `deno` as opposed to `tsc/node.js`. I wish `deno` was more liberal in accepting a suffix-less version of the file URL (as if the file URLs server was doing context negotiations…)
  
- I also had difficulties (in fact, this is where I lost most of my time) with some specific libraries.
  - Using the use the `ajv` (JSON Schema validator) library from `npm`  was a challenge. Importing `npm:ajv` did not work for reasons that were too cryptic to me. After some fight, I finished by:
    - Importing `ajv` from another place:
        ```
        import Ajv from 'https://esm.sh/ajv@8.11.0';
        import addFormats from 'https://esm.sh/ajv-formats@2.1.1';
        ```

    - Giving up on using the 2019 version of `ajv`, which requires, in the `tsc/node.js` land, to do:
        ```
        import Ajv2019, { ErrorObject} from 'ajv/dist/2019'
        ```
        which simply did not work for `deno`. As a consequence, there is a feature of JSON schemas that is not implemented on the `deno` version in this project.

    - Looking for alternatives for `ajv` led to me to the possible usage of [Java Type Definition (JTD)](https://jsontypedef.com) instead of JSON schemas (there is a "native" JTD environment for `deno`). However JTD was simply too poor compared to JSON schemas in this project, so I shied away from it,
 
  - Importing a json file directly into the code in `tsc/node.js` and `deno` follows a different syntax. The former is:
    ```
    const schema = require('./vocab.schema.json')
    ```
    while the latter is
    ```
    import * as schema from "./schema.json" assert {type: "json"};
    ```
    It would be nice if these types of differences disappeared at some point...

    I know, it is possible to do this in a portable way through an explicit `node:fs`, but a simple import statement is so much nicer...

  - I was disappointed to hit difficulties when using the HTML DOM. I would have expected to simply reuse `jsdom` with an import on `npm:jsdom`, but using that (at least from this project) raised exceptions somewhere deep in the guts of `deno` and I did not even try to find out what it was. So I had to switch, instead, to the "native" `deno-dom` library. However, I hit some, albeit minor, differences that makes the code a bit different:

    - In `jsdom` one starts with
        ```
        const document = (new JSDOM(template_text)).window.document;
        ```

        which is the "browser" way of getting to the document element. The same step, in `deno-dom`, is:

        ```
        const document = (new DOMParser()).parseFromString(template_text, 'text/html');
        ```

        No big deal, but makes the two versions of the code incompatible again. Too bad.

    - `deno-dom` does to seem to implement the `Element.style` attribute. One has to do a `span.setAttribute('style', 'display: none');` instead of `span.style.display = none;`. That could be retrofitted to the original code, but it is a pity one has to do that...

    - Linting (at least in Visual Studio Code) kept complaining about the `HTMLElement` not being defined. Something to do with the way `deno` caches the various types. I then realized that the code runs correctly, so I could ignore that, but it was slightly irritating.
  
- I also tried to compile the my script into a single executable, but it failed. It was complaining about the `HTMLElement` as well as some implicit `any`-s that the linting process did not complain about. As some complains of compile were referring to other things, too, which were not clear, I have not tried to chase this down yet... (Note that `compile` is still labeled as experimental. It is a bit strange that running the code works but it cannot compile, though I have some ideas why.)

However, all in all, it was not too bad to make the conversion. Yes, `deno` is a moving target still, but moving ahead and, eventually, it may overcome the `tsc/node.js` approach. I particularly liked the fact that I did not have to worry about the package management all the time, which made my repo cleaner and leaner (I realize this means `deno` puts all kinds of files somewhere on my file systems at some weird place, but I am o.k. with that. If needed, I can clean those up but, in the meantime, it makes my work environment better.) Also, even on such a small project, the execution time is clearly shorter. 

Next time if I have some project to do, I may _start_ with `deno`, rather than using it as an after-thought...







