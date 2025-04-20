declare module 'pdf-parse' {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: Record<string, any>;
    metadata: Record<string, any>;
    text: string;
    version: string;
  }

  function PDFParse(dataBuffer: Buffer, options?: any): Promise<PDFData>;
  
  export = PDFParse;
}