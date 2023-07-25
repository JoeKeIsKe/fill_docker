'use client';

import { Modal } from 'flowbite-react';
import { useState } from 'react';
import Button from '@/packages/button';
import { data } from 'autoprefixer';



interface Props{ 
    btn_text: string
    children: JSX.Element,
    title: string,
    btn?:JSX.Element,
    onChange?: (type: boolean) => void,
    footer?:JSX.Element|boolean
    
}

export default function DefaultModal(props: Props) {
    const { btn,btn_text,children,title,onChange,footer} = props;
    const [openModal, setOpenModal] = useState<string | undefined>();
    const propsModal = { openModal, setOpenModal };
    


    const renderFooter = () => { 
         if(typeof footer === 'boolean') { 
          return footer
         }
        if (footer) { 
        return <Modal.Footer>
                {footer}
            </Modal.Footer>
        }
        return <Modal.Footer>
                    <Button className='bg-focus' onClick={() => { 
                        propsModal.setOpenModal(undefined);
                        if (onChange) { 
                            onChange(true)
                        }
                    }}>Confirm</Button>
                    <Button  onClick={() => { 
                        propsModal.setOpenModal(undefined);
                        if (onChange) { 
                            onChange(false)
                        }
                    }}>
                Cancel
            </Button>
                </Modal.Footer>
    }

    return (
        <>
        {btn ? <span  onClick={() => propsModal.setOpenModal('default')}>{btn}</span> :<Button className='bg-focus' onClick={() => propsModal.setOpenModal('default')}>{btn_text}</Button>}
      <Modal show={propsModal.openModal === 'default'} onClose={() => propsModal.setOpenModal(undefined)}>
        <Modal.Header>{title}</Modal.Header>
        <Modal.Body>
                { children}
                </Modal.Body>
        {renderFooter()}
      </Modal>
    </>
  )
}


