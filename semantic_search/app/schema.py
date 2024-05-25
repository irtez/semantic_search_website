from pydantic import BaseModel, Field
from typing import Optional, List


class ErrorResponse(BaseModel):
    """
    Error response for the API
    """
    error: bool = Field(..., example=True, title='Whether there is error')
    message: str = Field(..., example='', title='Error message')
    traceback: Optional[str] = Field(None, example='', title='Detailed traceback of the error')

class SuccessResponse(BaseModel):
    message: str = Field(..., example='OK')

class FoundDocument(BaseModel):
    document_id: str = Field(..., example='663fa9788275d659b2aa3caf', title='Document id from MongoDB')
    similarity_score: float = Field(..., example=0.76545345, title='Document similarity score')

class SimilarDocumentsResponse(BaseModel):
    title: List[FoundDocument] = Field(..., description='Documents with similar title')
    text: List[FoundDocument] = Field(..., description='Documents with similar text')

class Document(BaseModel):
    id: str = Field(..., example='663fa9788275d659b2aa3caf', title='Document id from MongoDB')
    gost_number: str = Field(..., example='ГОСТ 20809-75', title='Document (GOST) number')
    title: str = Field(..., example='Патроны охотничьи 9х53. Типы и основные размеры', title='Document title')
    path: Optional[str] = Field(default="", example='c:/uploads/file.pdf', title='Document absolute file path on server')
