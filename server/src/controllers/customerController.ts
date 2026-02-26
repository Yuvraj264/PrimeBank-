import { Request, Response, NextFunction } from 'express';
import { customerService } from '../services/CustomerService';
import catchAsync from '../utils/catchAsync';

export const getAllCustomers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const customers = await customerService.getAllCustomers();
    res.status(200).json({ status: 'success', data: customers });
});

export const getCustomerById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = await customerService.getCustomerById(req.params.id as string);
    res.status(200).json({ status: 'success', data });
});

export const updateCustomerStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const customer = await customerService.updateCustomerStatus(req.params.id as string, req.body.status);
    res.status(200).json({ status: 'success', data: customer });
});

export const createCustomer = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = await customerService.createCustomer(req.body);
    res.status(201).json({ status: 'success', data });
});
