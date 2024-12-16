#include <string>
#include <fstream>
#include <iostream>
#include <sstream>
#include <vector>
using namespace std;
class SubstitutionTable
{
    string substitutionTable[64];
    string language;
    const string Devnagari[64] = {
        // Vowels: hasv, dirgh, pluta
        // 1, 2, 3
        "अ", "आ", "आा",
        // 4, 5, 6
        "इ", "ई", "ईी",
        // 7, 8, 9
        "उ", "ऊ", "ऊू",
        // 10, 11, 12
        "ऋ", "ॠ", "ॠॄ",
        // 13, 14, 15
        "ळ", "ळु", "ळू",
        // 16, 17, 18
        "ए", "एा", "एाा",
        // 19, 20, 21
        "ऐ", "ऐो", "ऐोो",
        // 22, 23, 24
        "ओ", "ओो", "ओोो",
        // 25, 26, 27
        "औ", "औौ", "औौौ",
        // Grouped consonants
        // 28, 29, 30, 31, 32
        "क्", "ख्", "ग्", "घ्", "ङ्",
        // 33, 34, 35, 36, 37
        "च्", "छ्", "ज्", "झ्", "ञ्",
        // 38, 39, 40, 41, 42
        "ट्", "ठ्", "ड्", "ढ्", "ण्",
        // 43, 44, 45, 46, 47
        "त्", "थ्", "द्", "ध्", "न्",
        // 48, 49, 50, 51, 52
        "प्", "फ्", "ब्", "भ्", "म्",
        // 53, 54, 55, 56, 57
        "य्", "र्", "ल्", "व्", "श्",
        // Un-grouped consonants
        // 58, 59, 60
        "ष्", "स्", "ह्",
        // Special characters
        // 61, 62, 63, 64
        "ं", "ः", "...", "::"};
    const string Devnagari2[64] = {
        // Vowels: hasv, dirgh, pluta
        // 1, 2, 3
        "अ", "आ", "अ३",
        // 4, 5, 6
        "इ", "ई", "इ३",
        // 7, 8, 9
        "उ", "ऊ", "उ३",
        // 10, 11, 12
        "ऋ", "ॠ", "ऋ३",
        // 13, 14, 15
        "ळ", "ळु", "ळू",
        // 16, 17, 18
        "ए१", "ए", "ए३",
        // 19, 20, 21
        "ऐ", "ऐ२", "ऐ३",
        // 22, 23, 24
        "ओ१", "ओ", "ओ३",
        // 25, 26, 27
        "औ", "औ२", "औ३",
        // Grouped consonants
        // 28, 29, 30, 31, 32
        "क्", "ख्", "ग्", "घ्", "ङ्",
        // 33, 34, 35, 36, 37
        "च्", "छ्", "ज्", "झ्", "ञ्",
        // 38, 39, 40, 41, 42
        "ट्", "ठ्", "ड्", "ढ्", "ण्",
        // 43, 44, 45, 46, 47
        "त्", "थ्", "द्", "ध्", "न्",
        // 48, 49, 50, 51, 52
        "प्", "फ्", "ब्", "भ्", "म्",
        // 53, 54, 55, 56, 57
        "य्", "र्", "ल्", "व्", "श्",
        // Un-grouped consonants
        // 58, 59, 60
        "ष्", "स्", "ह्",
        // Special characters
        // 61, 62, 63, 64
        "ं", "ः", "...", "::"};

    const string Kannada[64] = {
        // Vowels: hasv, dirgh, pluta
        // 1, 2, 3
        "ಅ", "ಆ", "ಆಾ",
        // 4, 5, 6
        "ಇ", "ಈ", "ಈೀ",
        // 7, 8, 9
        "ಉ", "ಊ", "ಊೂ",
        // 10, 11, 12
        "ಋ", "ೠ", "ೠೄ",
        // 13, 14, 15
        "ಳ", "ಳು", "ಳೂ",
        // 16, 17, 18
        "ಎ", "ಏ", "ಏೋ",
        // 19, 20, 21
        "ಐ", "ಐೖ", "ಐೖೖ",
        // 22, 23, 24
        "ಒ", "ಓ", "ಓೋ",
        // 25, 26, 27
        "ಔ", "ಔೌ", "ಔೌೌ",
        // Grouped consonants
        // 28, 29, 30, 31, 32
        "ಕ್", "ಖ್", "ಗ್", "ಘ್", "ಙ್",
        // 33, 34, 35, 36, 37
        "ಚ್", "ಛ್", "ಜ್", "ಝ್", "ಞ್",
        // 38, 39, 40, 41, 42
        "ಟ್", "ಠ್", "ಡ್", "ಢ್", "ಣ್",
        // 43, 44, 45, 46, 47
        "ತ್", "ಥ್", "ದ್", "ಧ್", "ನ್",
        // 48, 49, 50, 51, 52
        "ಪ್", "ಫ್", "ಬ್", "ಭ", "ಮ್",
        // 53, 54, 55, 56, 57
        "ಯ್", "ರ್", "ಲ್", "ವ್", "ಶ್",
        // Un-grouped consonants
        // 58, 59, 60
        "ಷ್", "ಸ್", "ಹ್",
        // Special characters
        // 61, 62, 63, 64
        "ಂ", "ಃ", "...", "::"};
    // make a substitution table in IPA
    const string IPA[64] = {
        // Vowels: hasv, dirgh, pluta
        // 1, 2, 3
        "a", "aː", "aːː",
        // 4, 5, 6
        "i", "iː", "iːː",
        // 7, 8, 9
        "u", "uː", "uːː",
        // 10, 11, 12
        "ɻ", "ɻː", "ɻːː",
        // 13, 14, 15
        "ɭ", "ɭu", "ɭuː",
        // 16, 17, 18
        "e", "eː", "eːː",
        // 19, 20, 21
        "ɛ", "ɛː", "ɛːː",
        // 22, 23, 24
        "o", "oː", "oːː",
        // 25, 26, 27
        "ɔ", "ɔː", "ɔːː",
        // Grouped consonants
        // 28, 29, 30, 31, 32
        "k", "kʰ", "g", "gʰ", "ŋ",
        // 33, 34, 35, 36, 37
        "t͡ʃ", "t͡ʃʰ", "d͡ʒ", "d͡ʒʰ", "ɲ",
        // 38, 39, 40, 41, 42
        "ʈ", "ʈʰ", "ɖ", "ɖʰ", "ɳ",
        // 43, 44, 45, 46, 47
        "t", "tʰ", "d", "dʰ", "n",
        // 48, 49, 50, 51, 52
        "p", "pʰ", "b", "bʰ", "m",
        // 53, 54, 55, 56, 57
        "j", "r", "l", "ʋ", "ʃ",
        // Un-grouped consonants
        // 58, 59, 60
        "ʂ", "s", "ɦ",
        // Special characters
        // 61, 62, 63, 64
        "ŋ", "ɦ", "...", "::"};

public:
    SubstitutionTable(string language) : language(language)
    {
        if (language == "Devnagari2")
        {
            for (int i = 0; i < 64; i++)
            {
                substitutionTable[i] = Devnagari2[i];
            }
        }
        else if (language == "Devnagari")
        {
            for (int i = 0; i < 64; i++)
            {
                substitutionTable[i] = Devnagari[i];
            }
        }
        else if (language == "Kannada")
        {
            for (int i = 0; i < 64; i++)
            {
                substitutionTable[i] = Kannada[i];
            }
        }
        else if (language == "IPA")
        {
            for (int i = 0; i < 64; i++)
            {
                substitutionTable[i] = IPA[i];
            }
        }
        else
        {
            for (int i = 0; i < 64; i++)
            {
                substitutionTable[i] = Devnagari[i];
            }
            this->language = "Devnagari";
        }
    }
    SubstitutionTable(string language, string *substitutionTable) : language(language)
    {
        for (int i = 0; i < 64; i++)
        {
            this->substitutionTable[i] = substitutionTable[i];
        }
    }
    // read from CSV
    SubstitutionTable(string language) : language(language)
    {
        const string filename = "substitution_table.tsv";
        ifstream file(filename);
        // read the first line containing the column names
        string headerLine;
        getline(file, headerLine);
        // split header line into column Names. Store them in a vector
        stringstream ss(headerLine);
        string columnName;
        vector<string> columnNames;
        while (getline(ss, columnName, '\t'))
        {
            columnNames.push_back(columnName);
        }
        // find the index of the column with the language name
        int languageIndex = -1;
        for (int i = 0; i < columnNames.size(); i++)
        {
            if (columnNames[i] == language)
            {
                languageIndex = i;
                break;
            }
        }
        // if the language is not found, set the language to Devnagari
        if (languageIndex == -1)
        {
            languageIndex = 1;
            this->language = "Devnagari";
        }
        // read the rest of the lines
        string line;
        int i = 0;
        while (getline(file, line))
        {
            stringstream ss(line);
            string cell;
            int j = 0;
            while (getline(ss, cell, '\t'))
            {
                if (j == languageIndex)
                {
                    substitutionTable[i] = cell;
                    break;
                }
                j++;
            }
            i++;
        }
    }
    string *getSubstitutionTable() const
    {
        string *returnSubstitutionTable = new string[64];
        for (int i = 0; i < 64; i++)
        {
            returnSubstitutionTable[i] = substitutionTable[i];
        }
        return returnSubstitutionTable;
    }
    string getLanguage() const
    {
        return language;
    }
    string operator[](int index) const
    {
        return substitutionTable[index];
    }
    void print() const
    {
        for (int i = 0; i < 64; i++)
        {
            cout << substitutionTable[i] << " ";
        }
        cout << endl;
    }
};