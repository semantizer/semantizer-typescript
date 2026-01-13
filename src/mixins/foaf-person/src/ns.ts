const foaf = 'http://xmlns.com/foaf/0.1/';

export type MyersBriggs = 'ESTJ' | 'INFP' | 'ESFP' | 'INTJ' | 'ESFJ' | 'INTP' | 'ENFP' | 'ISTJ' | 'ESTP' | 'INFJ' | 'ENFJ' | 'ISTP' | 'ENTJ' | 'ISFP' | 'ENTP' | 'ISFJ';

export const FOAF = {
    namespace: foaf,
    AGE: foaf + 'age',
    GIVEN_NAME: foaf + 'givenName'
}