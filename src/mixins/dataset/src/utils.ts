import { Quad_Graph, Quad_Predicate, Quad_Subject, QuadGraph, QuadPredicate, QuadSubject, Semantizer, Term } from "@semantizer/types";

export function isUrlAbsolute(url: string) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

export function isUrlRelative(url: string, base: string) {
    new URL(base); // test base URL or throw
    try {
        new URL(url);
        return false;
    } catch (e) {
        new URL(url, base);
        return true;
    }
}

/**
 * Computes the relative URL of a given absolute or relative URL based on a specified base URL.
 * If the input URL is already relative, it is returned as-is.
 * If the input URL matches the base URL, an empty string is returned.
 * If the input URL includes a hash fragment that matches the base URL path, only the fragment is returned.
 *
 * @param url - The absolute or relative URL to be converted.
 * @param baseUrl - The base URL against which the relative URL is calculated.
 * @returns The relative URL with respect to the base URL, or an empty string if the URLs are identical.
 *
 * @throws {Error} If either the input URL or the base URL is invalid.
 */
export function getRelativeUrl(url: string, baseUrl: string): string {
    // Helper function to parse a URL
    function parseUrl(input: string): URL {
        try {
            return new URL(input);
        } catch (error) {
            throw new Error(`Invalid URL: ${input}`);
        }
    }

    // Return the URL as-is if it is already relative
    if (isUrlRelative(url, baseUrl)) {
        return url; // Already relative
    }

    const absoluteUrl = parseUrl(url);
    const baseParsedUrl = parseUrl(baseUrl);

    // If the URLs are identical, return an empty string
    if (absoluteUrl.href === baseParsedUrl.href) {
        return "";
    }

    // If the base matches and the URL has a fragment, return only the fragment
    if (
        absoluteUrl.origin === baseParsedUrl.origin &&
        absoluteUrl.pathname === baseParsedUrl.pathname &&
        absoluteUrl.hash
    ) {
        return absoluteUrl.hash;
    }

    // Split paths into segments
    const absoluteSegments = absoluteUrl.pathname.split('/').filter(segment => segment !== '');
    const baseSegments = baseParsedUrl.pathname.split('/').filter(segment => segment !== '');

    // Find the common prefix length
    let commonIndex = 0;
    while (
        commonIndex < absoluteSegments.length &&
        commonIndex < baseSegments.length &&
        absoluteSegments[commonIndex] === baseSegments[commonIndex]
    ) {
        commonIndex++;
    }

    // Calculate the relative path
    const backtracking = baseSegments.length - commonIndex - 1; // -1 to adjust for the current directory
    const relativeSegments = '../'.repeat(backtracking) + absoluteSegments.slice(commonIndex).join('/');

    return relativeSegments || './';
}

export function getTermsFromQuadSubjectPredicateAndGraph(semantizer: Semantizer, subject: QuadSubject, predicate: QuadPredicate, graph?: QuadGraph): { subjectTerm: Quad_Subject, predicateTerm: Quad_Predicate, graphTerm?: Quad_Graph } {
    const { namedNode } = semantizer.getConfiguration().getRdfDataModelFactory();
    const subjectTerm = typeof subject === 'string' ? namedNode(subject) : subject;
    const predicateTerm = typeof predicate === 'string' ? namedNode(predicate) : predicate;
    const graphTerm = typeof graph === 'string' ? namedNode(graph) : graph;
    return {
        subjectTerm,
        predicateTerm,
        graphTerm
    }
}

export function getTermsFromTermOrStringOrNull(semantizer: Semantizer, subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): { subjectTerm: Quad_Subject | null, predicateTerm: Quad_Predicate | null, graphTerm?: Quad_Graph | null } {
    const { namedNode } = semantizer.getConfiguration().getRdfDataModelFactory();
    const subjectTerm = typeof subject === 'string' ? namedNode(subject) : subject;
    const predicateTerm = typeof predicate === 'string' ? namedNode(predicate) : predicate;
    const graphTerm = typeof graph === 'string' ? namedNode(graph) : graph;
    return {
        subjectTerm,
        predicateTerm,
        graphTerm
    }
}