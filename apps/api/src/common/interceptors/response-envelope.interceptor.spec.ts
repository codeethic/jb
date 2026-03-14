import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { ResponseEnvelopeInterceptor } from './response-envelope.interceptor';

describe('ResponseEnvelopeInterceptor', () => {
  let interceptor: ResponseEnvelopeInterceptor<unknown>;

  beforeEach(() => {
    interceptor = new ResponseEnvelopeInterceptor();
  });

  it('should wrap data in envelope with data and null error', (done) => {
    const mockData = { id: '1', name: 'Test' };
    const callHandler: CallHandler = { handle: () => of(mockData) };
    const ctx = {} as ExecutionContext;

    interceptor.intercept(ctx, callHandler).subscribe((result) => {
      expect(result).toEqual({ data: mockData, error: null });
      done();
    });
  });

  it('should wrap array data in envelope', (done) => {
    const mockData = [{ id: '1' }, { id: '2' }];
    const callHandler: CallHandler = { handle: () => of(mockData) };
    const ctx = {} as ExecutionContext;

    interceptor.intercept(ctx, callHandler).subscribe((result) => {
      expect(result).toEqual({ data: mockData, error: null });
      done();
    });
  });

  it('should wrap undefined as null in data field', (done) => {
    const callHandler: CallHandler = { handle: () => of(undefined) };
    const ctx = {} as ExecutionContext;

    interceptor.intercept(ctx, callHandler).subscribe((result) => {
      expect(result).toEqual({ data: null, error: null });
      done();
    });
  });
});
