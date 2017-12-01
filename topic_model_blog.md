# Turing Institute research from the perspective of a machine

1<sup>st</sup> December 2017

The Alan Turing Institute brings together researchers from a wide range of disciplines.
Although it is relatively easy to find out what any individual researcher is working on, it is harder to summarize the overarching research themes of the Institute.
A common question we hear is: What exactly does the Turing do?
As a data science team, we wanted to try to "use data science" to answer this question.  

Academic research is fairly well suited to analysis.
Academics publish a large number of articles, which means there is a great quantity of data about each researcher and a lot of it is freely available as open access is becoming increasingly popular.
Additionally, data science has produced a wide variety of powerful tools for analysis of text data and this includes methods for extracting themes or topics from large collections of texts.

The figure below presents topics extracted from the last five years of research articles published by Turing fellows.
The rest of this blog outlines the process of going from research articles to this visualisation.
For now, note that each circle is a Turing fellow and the coloured segments reflect research topics.
The list of topics on the left provides a key to interpreting the individual research profiles and it gives an overall view of the research expertise at the Turing.
The diagram also allows for a quick comparison between fellows; if two fellows have a similar visualisation, then their research is likely to have shared themes (although notice that some of these themes are quite broad).

![](visualisation/turing_fellows_topics.png)
*The figure represents Turing Fellows who were listed on the Turing Institute website in October 2017 - some current Turing Fellows are thus missing*

### Identifying research topics

Algorithms developed for discovering "topics" in a collection of documents are called topic models.
Broadly, topic models try to capture a general intuition that documents about some topic use certain words more frequently than others.
The most basic representation of a language is its vocabulary.
Correspondingly, the most commonly used method of representing documents in analysis is as counts of how many times each word in the vocabulary appears in each document (the so-called bag-of-words model).
Remarkably, these relatively simple models, which ignore meaningful language features such as word order, seem to work pretty well.

In this context, a topic is defined as a probability distribution over our vocabulary.
To be more specific, lets imagine I only have 4 words in my vocabulary: `British`, `Czech`, `weather` and `beer`.
I could define any number of topics as distributions over that vocabulary.
As an example, lets consider these two topics:

|                  | `British` | `Czech`   | `weather` | `beer`    |
| ---------------- |:-------:| -------:| -------:| -------:|
| Topic 1: *Britain*    |   0.8    |   0.0    |   0.1    |   0.1    |
| Topic 2: *the Czech Republic* |   0.0    |   0.5    |  0.2    |   0.3    |

The word `British` has probability 0.8 of being written in the context of the first (*Britain*), topic, but has a probability of 0.0 of being used in the context of the second (*the Czech Republic*), topic.
Notice that the labels *Britain* and *the Czech Republic* are not part of the definition of a topic.
They are something that I have added to make sense of what, in essence, is just a list of words.
And that is all that a topic, in a topic modelling sense, is; a collection of words, each with an associated probability of being used.
Topic is not a coherent concept or an understanding of the world, that is something that I have to impose on it.

The most commonly used topic modelling method is *Latent Dirichlet Allocation* (LDA), which assumes that documents are a mixture of topics.
Lets imagine I want to write a document that is mostly about *the Czech Republic* and also refers to *Britain*, but less frequently (i.e., *the Czech Republic* is the dominant topic in the document).
In addition to defining a topic as a probability distribution over a vocabulary, LDA defines a document as a probability distribution over all topics:

| |<span style="font-weight:normal">Topic 1: *Britain*</span> |<span style="font-weight:normal">Topic 2: *the Czech Republic*</span>|
|---|:-------:|:-------:|
| Document| 0.2 | 0.8 |    

i.e., this document refers to *the Czech Republic* four times as often as *Britain*.

According to LDA I use the following procedure to write a document:

1. **Choose a topic at random according to the document probabilities**: in this example, I would choose *the Czech Republic* 80% of the time.
2. **Randomly choose a word from that topic**: that is, go to the row in the topic table (the first table) that corresponds to the selected topic and then select a word from the vocabulary according to the probabilities in that row. If the selected topic is *Britain*, then I pick the word `beer` 10% of the time. Conversely, if instead the topic is *the Czech Republic*, the word `beer` is selected 30% of the time.

If I want to write a 10 word document, then I repeat this two-step process 10 times.
In the current example, I might generate something like:

`Czech beer Czech beer Czech beer Czech weather British weather`

Having defined this generative process, LDA can be used in the reverse sense: given some documents, infer the topics.
In the example above, I would examine the topic table and see that `Czech` and `beer` are frequently used in the context of one of the topics.
In practice, one would examine the *top N* most probable words for each topic (where N is chosen by hand, say 5), since the vocabulary may be very large.
Given my knowledge of the world, I *interpret* this topic as relating to *the Czech Republic*, and therefore give the topic this name.
Then, when analysing future documents, I can say things like 'this document is about the Czech Republic'.

### Challenges

As mentioned at the beginning, the research topics displayed in the figure are a result of applying LDA to articles written by Turing fellows.
Originally, the plan was to use only article abstracts rather than full texts, as these are easier to obtain.
However, in the context of this project, LDA performed significantly better when applied to full articles.
That is, the topics were more interpretable.
This is really not too surprising given the dataset was quite small.

Nevertheless, the hardest aspect of using LDA was topic interpretation and labelling.
The examples in the literature tend to be quite idealised and produce very clearly identifiable topics.
In contrast, the *top* (most probable or most unique) words returned for each topic in this analysis were not all that clear cut.
In the end I also extracted the titles of articles that were assigned the highest proportion of a given topic.
This gave me a solid context for the retrieved topic words and made topic interpretation much easier.
This is likely because the topics in this particular application are highly specialised and quite subtle.
Research articles overall tend to follow certain structures and vocabulary that is not as distinct (even between research fields) as when you compare, for example, articles about *sports* with articles about *politics*.

The final challenge was creating an effective visualisation of the topics.
The least frequent topics were collapsed into a single *other* topic.
Even so, this left 14 topics (from the originally modelled 25) to visualise for almost 100 Turing fellows.
This is a lot of information to convey in a single visualisation.
I did not expect to ever find myself opting for any variant of a pie chart as a means of displaying information.
However, I do believe that, in this case, it works well.
This was probably the most surprising part of the whole project.

As is typical of data science projects, the key challenge was collating the data.
In the figure, researchers who are represented in grey are those for whom I did not manage to download at least 5 articles.
I wanted to flag instances where there was not sufficient data (granted that I have arbitrarily decided that 5 articles is "sufficient").
This does not reflect how many articles any of the researchers has published.
It reflects the limits of using largely automated methods to gather data from disparate sources.

Overall, LDA offers a useful method of analysing and clustering text data.
Especially if you do not know much about the text data to begin with.
It gave us a tool for making quick comparisons between Turing fellows and learning something about the Institute.
However, one feature of the dataset was that the first few topics always came out as very broad and large.
For example, there is a wide variety of research that falls under the topic *Social and Applied Data Science* that one might want to unpack.
Further, this entire exercise is only ever backward looking.
The key motivation behind an Institute such as the Turing is to promote new, interdisciplinary research in a still very young research field.
Clearly, not much of that is captured in the current analysis.
The really interesting exercise will be repeating this once the Institute has been around for at least 5 years.
Then we should be able to say what *Data Science the Turing way* really is.

All of the code to reproduce this work can be found on [GitHub](https://github.com/alan-turing-institute/ati_tm).

*By Radka Jersakova*
