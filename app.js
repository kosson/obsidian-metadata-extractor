/*
* name: obsidianmetaextractor
* version 0.0.1
* A script to extract metadata from Obsidian frontend
* September 2024
* Nicolaie Constantinescu, <kosson@gmail.com>
* https://stackoverflow.com/questions/62586022/node-js-how-to-read-write-a-markdown-file-changing-its-front-matter-metadata
*/
const frontmatter = require('markdown-it-front-matter');
const md = require('markdown-it')({
    html: true,
    typographer: true,
    quotes: '“”‘’',
}); // https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md
md.use(frontmatter);

let converter = require('json-2-csv');
const matter  = require('gray-matter'); /* Extract meta data (front-matter) from documents. */
const yaml    = require('js-yaml');
const { stringify } = require("yaml");
const fs      = require('fs/promises');
const globby  = require('globby');
const path    = require('node:path');
const { stat, constants } = require('fs');
const { Buffer } = require('node:buffer');
const { Console, log } = require('console');

try {

    /**
     * Recursively create a directory at the given `path`.
     * @param {String} path
     */
    async function ensureDir(path) {  
        await fs.mkdir(path, { recursive: true });
    }

    /**
     * Funcția returnează `true` dacă un fișier există
     * @param {String} path 
     * @returns 
     */
    const fileExists = path => fs.stat(path).then(() => true, () => false);

    /**
     * Funcția face o actualizare a câmpurilor și valorilor din frontmatter
     * @param {String} filename
     * @param {Object} options
     */
    async function updateFrontMatterAndRewriteFile(path, options) {
        const filepath = `${path}`; // ref la cale      
        const { data: frontMatter, content } = matter(await readFile(filepath)); // extrage un obiect cu frontmatter și restul fișierului markdown
      
        // Fă prelucrările pe care le dorești
        // Exemple comentate mai jos:
        // // remove desc attribute
        // if (frontMatter.desc === "") {
        //   delete frontMatter["desc"];
        // }      
        // // parse created date attribute and convert it as timestamp
        // if (typeof frontMatter.created === "string") {
        //   frontMatter.created = new Date(frontMatter.created).getTime();
        // }
        
        // Pentru fiecare proprietate a obiectului de opțiuni pentru modificarea frontmatter-ului
        // care are valoarea "del" sau "-", aceasta va fi ștearsă din frontmatter
        // Pentru tot ce este nou, va fi introdus în frontmatter
        Object.entries(options).forEach(function ([fieldName, value]) {
            if (value === "del" || value === "-") {
              delete frontMatter[fieldName];
            } else {
              frontMatter[fieldName] = value;
            }
        });

        /*  // Mai jos este un exemplu de exploatare a scriptului așa cum apare în
            // https://stackoverflow.com/questions/62586022/node-js-how-to-read-write-a-markdown-file-changing-its-front-matter-metadata
            // Publica și ca modul la https://www.npmjs.com/package/markdown-frontmatter-processor
            // ---
            // field: example value
            // another_field: some value
            // ---
            // Markdown content
            const md = '---\nfield: example value\nanother_field: some value\n---\nMarkdown content'

            const options = {
                field: 'new example value',
                another_field: 'del',
                new_field: 'a new field!'
            }

            console.log(processFrontmatter(md, options))
        */

        const newContent = `---\n${stringify(frontMatter)}---\n${content}`; // creează structura și conținutul viitorului fișier Markdown
        await writeFile(filepath, newContent); // scrie fișierul pe disc      
        console.log(`- [x] ${filepath}`); // semnalează efectuarea modificărilor
    }

    /**
     * Funcția creează un fișier în calea specificată
     * @param {*} path 
     */
    async function createNewFile(path, payload) {
        let fileHandle = null;
        let prom = null;
        let buffer = Buffer.from(payload);
        try {
            fileHandle = await fs.open(path, 'a');
            prom = fileHandle.write(buffer, 0, buffer.length, 0);
            // console.log('fileHandle ==> ', fileHandle);
        } catch (err) {
            console.log('err ==> ', err)
        } finally {
            if (fileHandle) {
                // Afișează rezultatul
                // prom.then(function (result) {
                //     console.log("file after write operation :- " + (result.buffer).toString());
                // });               
                await fileHandle.close();
            }
        }
    };
    
    /**
     * Funcția extrage căile directoarelor și apelează `fileNameExtractor()` pe fiecare
     * Aceasta este funcția care inițializează procesul
     * @see fileNameExtractor
     */
    async function workOnpaths () {
        let paths = await globby(['./DOCS/**/*.md']);

        // Alternativa la globby ar fi următoarea mai jos (NU ȘTERGE!!!)
        // const filenames = await readdir(directory);
        // const markdownFilenames = filenames.filter((f) => f.endsWith(".md"));
        // await Promise.all(markdownFilenames.map(updateFrontMatter));

        // console.log(`Căile de prelucrare sunt ${paths}`);
        paths.map(metadataExtract);
    };

    /**
     * Funcția va prelucra fișierul cu extensia .md din calea pasată
     * @param {String} path O cale a fișierului .md extrasă de globby la parsarea structurii de subdirectoare din ./DOCS
     */
    const metadataExtract = async (note_path) => {

        try {
            const mkd = await fs.readFile(note_path, { encoding: 'utf8' }); // citește .md
            
            // console.log(`Calea pe care o prelucrez este ${note_path}`);
            let filename = path.basename(note_path); // nume fișier
            let nameOfSubdir = path.parse(note_path).dir.split("/").slice(-1);           
            let origDir  = path.dirname(note_path); // nume director din care provine fișierul
            let newJson  = path.join(origDir, `${nameOfSubdir}.json`);
            let newPath  = path.join(origDir, `${nameOfSubdir}.csv`);

            const { data: frontMatter, content } = matter(mkd); // metadatele și conținutul

            // scoate diezurile și slash-urile din tags            
            frontMatter.tags = frontMatter.tags.map(tag => {
                return tag.slice(1).split('/').join(' ');
            });
            // console.log(frontMatter.tags);

            // Scrie datele JSON într-un fișier
            await createNewFile(newJson, `${JSON.stringify(frontMatter, null, 2)},`); //creează un fișier

            // Scrie CSV-ul
            const csv = await converter.json2csv(frontMatter, {delimiter: {wrap: ""}});
            // Creează un Buffer
            const CSVmeta = new Uint8Array(Buffer.from(csv));
            // Scrie Buffer-ul pe disc
            await fs.appendFile(newPath, CSVmeta);

        } catch (error) {
            console.error(error);
        }
    }
    // Funcția care apelată va porni prelucrarea
    workOnpaths();
} catch (error) {
    console.error(error);
}
