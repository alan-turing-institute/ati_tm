
## Converting .pdf to .txt using NORMA (Contentmine)

see:  
http://contentmine.org  
https://github.com/ContentMine/norma  
https://github.com/ContentMine/norma/blob/master/docs/TUTORIAL.md  
https://github.com/ContentMine/workshop-resources/tree/master/software-tutorials/norma

installation instructions:  
http://contentmine.org/install  
http://contentmine.github.io

1: place all pdfs that want to convert into a single folder (e.g. papers)   
2: navigate into the newly created directory and run the following command (this will place all pdf files in a directory of their own and rename each file 'fulltext.pdf')


```shell
cd papers
for fname in *.pdf; 
do 
filename=$(basename "$fname"); filename="${filename%.*}"; 
mkdir "$filename"; mv "$fname" "$filename"/fulltext.pdf; 
done
```

3: exit the 'papers' directory and run the following command which converts each fulltext.pdf file into fulltext.txt

```shell
cd ..
norma --project papers/ -i fulltext.pdf -o fulltext.txt --transform pdf2txt
```
