import { Request, Response, NextFunction } from 'express';
import Vendor from '../models/Vendor';
import BusinessProfile from '../models/BusinessProfile';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';

export const createVendor = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user._id;

    const vendor = await Vendor.create({
        businessId: userId,
        name: req.body.name,
        accountNumber: req.body.accountNumber,
        ifsc: req.body.ifsc,
        bankName: req.body.bankName,
        gstNumber: req.body.gstNumber
    });

    res.status(201).json({
        status: 'success',
        data: vendor
    });
});

export const getVendors = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user._id;

    // Optional query parsing for active/inactive filters
    const filter: any = { businessId: userId };
    if (req.query.isActive !== undefined) {
        filter.isActive = req.query.isActive;
    }

    const vendors = await Vendor.find(filter).sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: vendors.length,
        data: vendors
    });
});

export const getVendorById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user._id;

    const vendor = await Vendor.findOne({ _id: req.params.id, businessId: userId });

    if (!vendor) {
        return next(new AppError('Vendor not found or you lack permission to view it.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: vendor
    });
});

export const updateVendor = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user._id;

    const vendor = await Vendor.findOneAndUpdate(
        { _id: req.params.id, businessId: userId },
        req.body,
        { new: true, runValidators: true }
    );

    if (!vendor) {
        return next(new AppError('Vendor not found.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: vendor
    });
});

export const toggleVendorStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user._id;
    const { isActive } = req.body;

    const vendor = await Vendor.findOneAndUpdate(
        { _id: req.params.id, businessId: userId },
        { isActive },
        { new: true }
    );

    if (!vendor) {
        return next(new AppError('Vendor not found.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: vendor
    });
});
