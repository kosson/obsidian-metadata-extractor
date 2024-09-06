# Obsidian metadata extractor

@en_GB: This script extracts the metadata from Markdown frontends. The script is designed to extract a JSON and a CSV version.

@ro_RO: Scriptul extrage metadatele din frontend-ul fișierelor Markdown. Metadatele sunt agregate într-un fișier JSON și unul CSV.

The script is used to extract metadata from Obsidian generated noted following the arrangement:
- frontend 
- `# Title` followed by Enter `\n`;
- name of the author/authors
- text of the abstract

The following is an example.

```markdown
---
alias: SWIB
type: presentation
event: SWIB 2010
year: 2010
partof: ''
tags:
  - '#information/science'
  - '#courses'
  - '#librarianship'
  - '#infrastructure'
  - '#competencies'
  - '#semantic/web'
  - '#pow'
  - '#skills'
title: Semantic Web in librarianship training - Which skills must be taught?
alt: 'Semantic Web in der bibliothekarischen Ausbildung - Welche Kompetenzen müssen vermittelt werden?'
resources:
  - https://swib.org/swib10/vortraege/swib10_neher.pdf
  - http://dx.doi.org/10.4016/27048.01
author:
  - Günther Neher
  - Dierk Eichel
abstract: 'Semantic web and in particular linked data infrastructures open up a multitude of new possibilities for the application of classic library, general information science competencies in the area of information organization and knowledge transfer. In the opinion of the authors, the combination of classic information science skills and resilient, application-oriented knowledge of Semantic Web concepts and infrastructures offers great application potential in many areas, including non-library areas. However, the teaching of this interface competence often proves to be a non-trivial tightrope walk. Based on the experiences of corresponding courses, the lecture attempts, from the lecturer''s point of view (Günther Neher) and from the student''s point of view (Dierk Eichel).'
---
# Semantic Web in librarianship training - Which skills must be taught?
[[Günther Neher]], [[Dierk Eichel]]

Semantic web and in particular [[linked data infrastructures]] open up a multitude of new possibilities for the application of classic library, general information science competencies in the area of information organization and knowledge transfer. In the opinion of the authors, the combination of classic information science skills and resilient, application-oriented knowledge of [[Semantic Web]] concepts and infrastructures offers great application potential in many areas, including non-library areas. However, the teaching of this interface competence often proves to be a non-trivial tightrope walk. Based on the experiences of corresponding courses, the lecture attempts, from the lecturer’s point of view ([[Günther Neher]]) and from the student’s point of view ([[Dierk Eichel]]).
```

If you want to work with the script, you need to have Node.js installed (18.x.x at the minimum). Install the packages with `npm install`.
Make sure you have put the notes in the `DOCS` subdirectory. Run the application with `node app.js` in terminal/console.

The script comes with an example already processed in `DOCS` subdirectory. For your own needs, you need to crear `DOCS` subdirectory.