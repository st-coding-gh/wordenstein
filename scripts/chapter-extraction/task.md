# chapter extraction

## task
the task is to extract chapters text from file ./docs/dragonbone-chair/source/dragonbone-chair.txt at separate txt files to ./docs/dragonbone-chair/extracted

## steps
1. identify the pattern for chapter's title: there is a newline or space or tab, then a consequitive number which is followed by some words, then newline and the chapter's text
2. extract the chapter's names to a json file:

```json
[
  {
    "number": 1,
    "name": "chapter's name"
  }
]
```
3. based on the extracted chapters' names extract chapters as separate files to the "extracted" directory