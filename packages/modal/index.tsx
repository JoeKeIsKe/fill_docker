'use client';

import { Modal } from 'antd';
import Button from '@/packages/button';
import { ITEM } from '@/utils/type';



interface footerItem extends ITEM { 
    className: number | string,
    onClick?: () => void
}
interface Props{ 
    children: JSX.Element,
    title: string,
    btn?:JSX.Element,
    onChange?: (type: boolean) => void,
    footer?: JSX.Element | Array<footerItem>,
    show:boolean
    
}

export default function DefaultModal(props: Props) {
    const { show, children, title, onChange, footer } = props;    
    const renderFooter = () => { 
        if (Array.isArray(footer)) { 
        return <div>
            {
                footer.map(footerItem => { 
                const showClass = footerItem.value === 'cancel' ?'bg-transparent' :'btn-default'
                    return <Button key={footerItem.value} className={`${showClass} ${footerItem?.className}`}
                        onClick={() => { if(typeof footerItem?.onClick === 'function' )  footerItem.onClick() }
                    }>{ footerItem.label}</Button>
            })}
            </div>
        } 
        return <div>
            {footer}
        </div>

    }
    
    return (
        <Modal title={title} open={show} footer={footer ? renderFooter() : null} onCancel={() => {onChange}}>
        { children}
      </Modal>
  )
}


