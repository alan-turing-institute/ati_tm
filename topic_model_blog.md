# Turing research from the perspective of a machine

The Alan Turing Institute brings together researchers from a wide range of disciplines.
A common question is therefore: 'what kind of research happens at the Turing?'
Although it is simple to find out the interests of any given researcher by talking to them, it is more complex to summarise the overarching research themes at the institute.
Different researchers will describe the same topic using different words, or perhaps neglect to mention the link between an aspect of their work and a particular field.
Since the Turing seeks to promote collaboration between researchers, it is important that the members of the institute can identify how they are similar to (and how they are different from) their colleagues, so that opportunities for novel collaborations can emerge.
As an internal project, the Data Science team has developed a tool for this purpose.
Data Science has produced a wide variety of tools for Natural Language Processing (NLP), meaning that an automated approach is possible.
The purpose of the project, then, is to examine the research topics at the Turing from the perspective of a computer.

A popular approach to 'topic analysis' (the process of extracting themes from text) is *Latent Dirichlet Allocation* (LDA).
Consequently, we applied this method to five years of research output from members of the Turing, in the form of research papers.
The results are summarized in the visualisation below.
The list of inferred research topics on the left hand side is ordered by topic size (i.e., the proportion of publications that the algorithm related to that topic).
Each circle in the diagram represents a Turing fellow.
The widths of the segments are the same between fellows, and are also proportional to the topic prevalence across all of the research papers analysed.
The coloured areas represent the proportion of a particular Turing fellow's work that touches upon each of the identified topics.
The diagram allows for a quick comparison between fellows.
If two fellows have similar visualisations, then their research is likely to have shared themes.
The key on the left (and the widths of each segment), provide an overall view of the research taking place at the Turing.

![](visualisation/turing_fellows_topics.png)  
*Note: Turing fellows represented in grey are those for whom the number of openly available research articles was insufficient to reliably infer their research topics.*

### What data?

As is typical in many data science projects, a challenge of this project was the acquisition and cleaning of relevant data.
More specifically, the challenge was finding a reliable, automatic method for obtaining academic publications through public APIs.
We used Microsoft’s [Academic Knowledge (AK) API](https://docs.microsoft.com/en-us/azure/cognitive-services/academic-knowledge/home), which is a free service for searching academic publications.
Some manual work is required due to entity matching issues: Turing researchers may identify themselves in a variety of ways in a publication (e.g., John Smith, or J. Smith, or John A. Smith may all correspond to the same individual).
However, once this small amount of manual work is completed, the API provides a list of publications for each researcher.
We hope to make the process entirely automated by solving the entity matching issue (but this is not trivial, and is a very interesting data science problem in itself).

Once the AK API has been queried, a list of article titles and source URLs is returned per researcher.
Occasionally, a second API (the [oaDOI API](https://oadoi.org)) must be queried using the article DOI (Digital Object Identifier) in order to find a URL from which the article can be downloaded.
The output of this procedure is a collection of PDF files, each corresponding to a publication from one of the Turing fellows.
Given the present collection of Turing fellows, the dataset is composed of around 1800 articles.

### Identifying research topics

Topic modelling is a statistical approach to discovering a set of themes in a collection of documents.
In our context, these themes are research areas.
This is done by analysing the frequency with which different words appear in those documents.
It is quite remarkable that these relatively simple models extract topics that make intuitive sense to humans.

As mentioned in the introduction, a commonly used topic modelling method is *Latent Dirichlet Allocation* (LDA).
LDA is as *generative* model: that is, the method provides a process by which new documents can be generated.
To understand the generative process, imagine that we have 2 topics: `the Czech Republic` and `Great Britain`, and we want to write a document that is mostly about `the Czech Republic` and also refers to `Britain`, but less frequently (i.e., `the Czech Republic` is the *dominant* topic in the document).
Furthermore, we have 4 words in our vocabulary: `British`, `Czech`, `weather` and `beer`.
In the context of LDA, a topic is simply a probability distribution over the vocabulary: some words are likely to belong to a given topic (e.g., we might expect the word `Czech` to have a high chance of relating to the topic `the Czech Republic`).
Example topic distributions might be   

|                  | `British` | `Czech`   | `weather` | `beer`    |
| ---------------- |:-------:| -------:| -------:| -------:|
| `Britain`    |   0.8    |   0.0    |   0.1    |   0.1    |
| `the Czech Republic` |   0.0    |   0.5    |  0.2    |   0.3    |

The word `British` has probability 0.8 of being written in the context of the `Britain` topic, but has a probability of 0.0 of being used in the context of `the Czech Republic`.
Similarly, a document is a probability distribution over topics:

|   | `Britain` | `the Czech Republic` |
|---|:-------:|:----------:|
|Document| 0.2 | 0.8 |

i.e., documents typically refer to `the Czech Republic` four times as often as `Britain` (perhaps the documents in our dataset come from a Czech library).

According to LDA one uses the following procedure to compose a document:

1. **Choose a topic at random according to the document probabilities**: in this example, I would choose `the Czech Republic` 80% of the time.
2. **Randomly choose a word from that topic**: that is, go to the row in the topic table (our first table) that corresponds to the selected topic and then select a word from the vocabulary according to the probabilities in that row. If the selected topic is `Britain`, then I pick the word `beer` 10% of the time. Conversely, if instead the topic is `the Czech Republic`, the word `beer` is selected 30% of the time.

If a 10 word document is required, then I repeat this two-step process 10 times.
In the current example, I might generate something like:   

`Czech beer Czech beer Czech beer Czech weather British weather`

Notice that LDA does not pay attention to the *order* of words in the document.
It simply generates the words that appear in the document.
For example, the following two documents are identical in the context of LDA:

`I like Czech beer`  
`beer Czech like I`.

Models of language that have this property are referred to as *bag of words* models.

When presented with a set of documents, LDA can be used to *infer* the topics that are present in the documents, as well as the topic proportions for each document.
In other words, the algorithm can be used in the reverse sense to the generative procedure described above: given some documents, infer the topics (as opposed to being given some topics and generating some documents).
The inferred topics must be interpreted by a human.
In the example above, one would examine the topic table and see that `Czech` and `beer` are frequently used in the context of one of the topics.
Given our knowledge of the world, we *interpret* this topic as relating to `the Czech Republic`, and therefore give the topic this name.
Then, when analysing future documents, we can say things like 'this document is about the Czech republic'.
In practise, one gives topics names by examining the *top N* most probable words for each topic (where N is chosen by hand, say 5), since the vocabulary may be very large.
For example, the most 5 frequent (probable) words in a topic might be `prior`, `distribution`, `posterior`, `sampling` and `inference` and we would label that topic as `Bayesian statistics`.
An issue that we have encountered is that topics may have probable words in common with one another.
In our case these were words such as `model`.
Consequently, we instead examined words that were *relatively common* in a topic, meaning that their frequency in a given topic was significantly higher than it was across the other inferred topics.
We also extracted the titles of articles that were assigned the highest proportion of a given topic.
Using a combination of these approaches, we came up with the topic labels listed in the final visualisation.

### Comments

In this section, we provide miscellaneous comments regarding the implementation and usage of LDA that readers might find useful.

Originally, we had planned to use only the abstracts to articles rather than the full text.
However, we found that LDA performed significantly better when applied to full articles (that is, the topics were more interpretable, and topic proportions less noisy).
However, as part of our literature review, we found a project that successfully used only article abstracts with LDA, but their dataset contained many more documents than ours.
It may be the case, therefore, that *overall word count* is an important metric when using LDA, rather than the number of documents or number of words per document.
It is also true that all the classic LDA examples come from large collections of articles and this might be the ideal setting for using LDA for text analysis, although we did not find much discussion of this in the literature (**is this surprising? Most algorithms work better when they have more data**).
Overall, we were impressed with the results of LDA when applied to the full articles.

Practically implementing LDA as a model (in Python or R, for example) is well described in the literature and on various blogs, with many ready-to-use implementations available.
The hardest aspect of using LDA was instead topic interpretation and labelling.
The examples in the literature tend to be quite idealised, and produce very distinct topics by comparison to our results.
For some topics, looking at frequent words was enough to reasonably interpret their meaning.
However, it was significant for this project to also look at titles of articles that were labelled as having the highest proportion of a given topic, because it gave us a solid context for the retrieved topic words.
In the end, it was necessary to gather a lot of information about the retrieved texts in addition to the returned topics, in order to come up with labels that were interpretable and meaningful.
In this sense, we found that significant human input was required to make LDA a worthwhile procedure.
This is likely because the topics in our particular application are highly specialised and quite subtle.

The final challenge relating to this project was the production of an effective visualisation of the results.
We collapsed the least frequent topics into a single `other` topic but, even so, we were left with 15 topics to visualise for over 120 Turing fellows.
This is a lot of information to convey in a single visualisation.
While we did not expect to ever find ourselves opting for any variant of a pie chart as a means of displaying information, we found them to be most useful in this case!

All of the code to reproduce this work can be found on [GitHub](https://github.com/alan-turing-institute/ati_tm).
